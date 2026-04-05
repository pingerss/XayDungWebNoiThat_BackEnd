module.exports = {
  ROLES: {
    CUSTOMER: 'ROLE_CUSTOMER',
    STAFF: 'ROLE_STAFF',
    ADMIN: 'ROLE_ADMIN'
  },
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPING: 'shipping',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed'
  },
  PAYMENT_METHOD: {
    VNPAY: 'vnpay',
    COD: 'cod'
  },
  PROMOTION_TYPE: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
  },
  STAFF_TYPE: {
    STAFF: 'Staff',
    ADMIN: 'Admin'
  }
};
