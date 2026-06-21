import "express";

declare global {
  namespace Express {
    interface Request {
      /** Set by the `protect` (user) auth middleware. */
      userId?: string;
      userEmail?: string;
      /** Set by the `protectPartner` (delivery) auth middleware. */
      partnerId?: string;
    }
  }
}

export {};
