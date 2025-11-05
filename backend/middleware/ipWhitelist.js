/**
 * IP Whitelist/Blacklist Middleware
 * Allows blocking or allowing specific IP addresses
 */

// Load IP lists from environment or config
const whitelist = (process.env.IP_WHITELIST || '').split(',').filter(Boolean);
const blacklist = (process.env.IP_BLACKLIST || '').split(',').filter(Boolean);

// Enable/disable whitelist mode
const whitelistEnabled = process.env.ENABLE_IP_WHITELIST === 'true';
const blacklistEnabled = process.env.ENABLE_IP_BLACKLIST === 'true' || blacklist.length > 0;

/**
 * Check if IP is in list
 */
function isInList(ip, list) {
  // Support CIDR notation in the future
  return list.includes(ip);
}

/**
 * Get client IP from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip
  );
}

/**
 * IP Whitelist Middleware
 */
const ipWhitelist = (req, res, next) => {
  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !whitelistEnabled) {
    return next();
  }

  const clientIp = getClientIp(req);

  // Check blacklist first
  if (blacklistEnabled && isInList(clientIp, blacklist)) {
    console.warn(`🚫 Blocked request from blacklisted IP: ${clientIp}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  // Check whitelist
  if (whitelistEnabled) {
    if (!isInList(clientIp, whitelist)) {
      console.warn(`🚫 Blocked request from non-whitelisted IP: ${clientIp}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
  }

  next();
};

/**
 * Get IP status
 */
function getIpStatus(ip) {
  return {
    ip,
    whitelisted: isInList(ip, whitelist),
    blacklisted: isInList(ip, blacklist),
    whitelistEnabled,
    blacklistEnabled,
  };
}

module.exports = {
  ipWhitelist,
  getClientIp,
  getIpStatus,
  whitelist,
  blacklist,
};
