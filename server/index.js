import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

// Temporary in-memory storage.
// Replace with the database later.
const orders = new Map();
const users = new Map();
const sessions = new Map();

function getFlutterwaveHeaders() {
  if (!process.env.FLW_SECRET_KEY) {
    throw new Error("FLW_SECRET_KEY is not configured.");
  }

  return {
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

function createOrderReference() {
  return `BU-ORD-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

function createUserId() {
  return `BU-USR-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return {
    hash,
    salt,
  };
}

function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt);

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getAuthToken(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

function getUserFromRequest(req) {
  const token = getAuthToken(req);

  if (!token) {
    return null;
  }

  const userId = sessions.get(token);

  if (!userId) {
    return null;
  }

  return users.get(userId) || null;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    addresses: user.addresses || [],
    createdAt: user.createdAt,
  };
}

function createSession(userId) {
  const token = createSessionToken();

  sessions.set(token, userId);

  return token;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return "";
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BeUnique API is running",
  });
});

/* =========================================================
   AUTH
========================================================= */

app.post("/api/auth/signup", (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone = "",
    } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    if (users.has(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email. Please sign in instead.",
      });
    }

    const { hash, salt } = hashPassword(password);

    const user = {
      id: createUserId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: String(phone || "").trim(),
      passwordHash: hash,
      passwordSalt: salt,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    users.set(normalizedEmail, user);

    const token = createSession(user.id);

    console.log(`Account created: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = users.get(normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const token = createSession(user.id);

    return res.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in.",
    });
  }
});

app.get("/api/auth/me", (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  return res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
  });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getAuthToken(req);

  if (token) {
    sessions.delete(token);
  }

  return res.json({
    success: true,
    message: "Signed out successfully.",
  });
});

/* =========================================================
   PAYMENTS
========================================================= */

app.post("/api/payments/initialize", async (req, res) => {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to continue to checkout.",
      });
    }

    const {
      email,
      firstName,
      lastName,
      amount,
      phone,
      address,
      city,
      state,
      items,
      subtotal,
      deliveryFee,
      callbackUrl,
    } = req.body;

    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        message: "Email and amount are required.",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail !== user.email) {
      return res.status(403).json({
        success: false,
        message: "The checkout email must match your account email.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required.",
      });
    }

    const numericAmount = Number(amount);
    const numericSubtotal = Number(subtotal);
    const numericDeliveryFee = Number(deliveryFee);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number.",
      });
    }

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Subtotal must be a valid number.",
      });
    }

    if (!Number.isFinite(numericDeliveryFee) || numericDeliveryFee < 0) {
      return res.status(400).json({
        success: false,
        message: "Delivery fee must be a valid number.",
      });
    }

    const calculatedTotal = numericSubtotal + numericDeliveryFee;

    if (Math.round(calculatedTotal) !== Math.round(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Order total could not be validated.",
      });
    }

    const txRef = `BU-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const orderReference = createOrderReference();

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      size: item.size || null,
      image: item.image || "",
    }));

    const order = {
      reference: orderReference,
      paymentReference: txRef,

      userId: user.id,

      status: "PENDING",

      customer: {
        firstName: firstName?.trim() || user.firstName,
        lastName: lastName?.trim() || user.lastName,
        email: normalizedEmail,
        phone: phone?.trim() || user.phone || "",
      },

      delivery: {
        address: address?.trim() || "",
        city: city?.trim() || "",
        state: state || "",
      },

      items: normalizedItems,

      subtotal: Math.round(numericSubtotal),
      deliveryFee: Math.round(numericDeliveryFee),
      total: Math.round(numericAmount),

      currency: "NGN",

      createdAt: new Date().toISOString(),
      paidAt: null,
    };

    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/payments`,
      {
        method: "POST",
        headers: getFlutterwaveHeaders(),
        body: JSON.stringify({
          tx_ref: txRef,
          amount: Math.round(numericAmount),
          currency: "NGN",
          redirect_url:
            callbackUrl ||
            `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/callback`,
          customer: {
            email: normalizedEmail,
            name: `${user.firstName} ${user.lastName}`.trim(),
            phonenumber: phone || user.phone || "",
          },
          customizations: {
            title: "BeUnique Wears",
            description: "Fashion order payment",
            logo: "",
          },
          meta: {
            orderReference,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            txRef,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      console.error("Flutterwave initialization failed:", data);

      return res.status(502).json({
        success: false,
        message:
          data.message || "Unable to initialize payment.",
      });
    }

    orders.set(orderReference, order);

    console.log(
      `Order ${orderReference} created for ${user.email} with status PENDING`,
    );

    return res.json({
      success: true,
      message: "Payment initialized successfully.",
      data: {
        authorizationUrl: data.data.link,
        reference: txRef,
        orderReference,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initialize payment.",
    });
  }
});

app.get("/api/payments/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required.",
      });
    }

    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: getFlutterwaveHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      console.error("Flutterwave verification failed:", data);

      return res.status(502).json({
        success: false,
        message:
          data.message || "Unable to verify payment.",
      });
    }

    const transaction = data.data;

    const verifiedStatus =
      String(transaction.status || "").toLowerCase();

    const verifiedCurrency = String(
      transaction.currency || "",
    ).toUpperCase();

    const verifiedAmount = Number(transaction.amount);

    const order = Array.from(orders.values()).find(
      (storedOrder) =>
        storedOrder.paymentReference === transaction.tx_ref,
    );

    if (verifiedStatus !== "successful") {
      if (order) {
        order.status =
          verifiedStatus === "pending"
            ? "PENDING"
            : "PAYMENT_FAILED";
      }

      return res.json({
        success: true,
        message: "Payment verification completed.",
        data: {
          status: transaction.status,
          reference: transaction.tx_ref,
          amount: transaction.amount,
          currency: transaction.currency,
          paidAt: transaction.created_at,
          processorResponse:
            transaction.processor_response,
          orderReference: order?.reference || null,
        },
      });
    }

    if (verifiedCurrency !== "NGN") {
      return res.status(400).json({
        success: false,
        message: "Payment currency could not be verified.",
      });
    }

    if (
      !Number.isFinite(verifiedAmount) ||
      verifiedAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount could not be verified.",
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Payment was successful, but the matching order could not be found.",
      });
    }

    if (Math.round(verifiedAmount) !== order.total) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match the order total.",
      });
    }

    order.status = "PAID";
    order.paidAt =
      transaction.created_at || new Date().toISOString();

    order.payment = {
      status: transaction.status,
      reference: transaction.tx_ref,
      amount: verifiedAmount,
      currency: verifiedCurrency,
      processorResponse:
        transaction.processor_response || "",
    };

    console.log(
      `Order ${order.reference} marked as PAID`,
    );

    return res.json({
      success: true,
      message: "Payment verification completed.",
      data: {
        status: transaction.status,
        reference: transaction.tx_ref,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        paidAt: order.paidAt,
        processorResponse:
          transaction.processor_response,
        orderReference: order.reference,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment.",
    });
  }
});

app.get("/api/orders/:reference", (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to view this order.",
    });
  }

  const { reference } = req.params;

  const order = orders.get(reference);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  if (order.userId !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You do not have access to this order.",
    });
  }

  return res.json({
    success: true,
    data: order,
  });
});

app.get("/api/orders", (req, res) => {
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to view your orders.",
    });
  }

  const userOrders = Array.from(orders.values())
    .filter((order) => order.userId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );

  return res.json({
    success: true,
    data: userOrders,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `BeUnique API running on port ${PORT}`,
  );
});