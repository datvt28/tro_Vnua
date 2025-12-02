const crypto = require('crypto');
const moment = require('moment-timezone');
const Room = require('../models/Room');
const Roommate = require('../models/Roommate');
const {
  vnp_Url,
  vnp_HashSecret,
  vnp_TmnCode,
  vnp_ReturnUrlRoom,
  vnp_ReturnUrlRoommate,
} = require('../config/env/index');

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  });
  return sorted;
}

class PaymentController {
  // Tạo link thanh toán VNPAY
  async createPayment(req, res) {
    try {
      const ipAddr =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;

      const data = req.body.data; // { roomId, type }
      const amount = 20000; // Giá cố định 20k

      const tmnCode = vnp_TmnCode;
      const secretKey = vnp_HashSecret;
      const vnpUrl = vnp_Url;
      const returnUrl = data.type ? vnp_ReturnUrlRoom : vnp_ReturnUrlRoommate;

      const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
      const orderId = data.roomId;
      const orderInfo = 'Thanh toán đặt phòng';
      const orderType = 'fashion';
      const locale = 'vn';
      const currCode = 'VND';
      const bankCode = 'VNBANK';

      let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);

      const querystring = require('qs');
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;

      const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

      return res.json({ vnpUrl: paymentUrl });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Tạo link thanh toán thất bại' });
    }
  }

  // Callback VNPAY
  async callbackVnpay(req, res) {
    try {
      const type = req.body.data?.type; // true: room, false: roommate
      let vnp_Params = req.query;
      const secureHash = vnp_Params['vnp_SecureHash'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      vnp_Params = sortObject(vnp_Params);

      const querystring = require('qs');
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac('sha512', vnp_HashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      if (secureHash === signed) {
        const roomId = vnp_Params['vnp_TxnRef'];
        if (type) {
          await Room.findByIdAndUpdate(roomId, { isCheckout: true });
          console.log(`Room ${roomId} checkout thành công`);
        } else {
          await Roommate.findByIdAndUpdate(roomId, { isCheckout: true });
          console.log(`Roommate ${roomId} checkout thành công`);
        }

        return res.status(200).json({ RspCode: '00', Message: 'success' });
      } else {
        return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Callback thất bại' });
    }
  }
}

module.exports = new PaymentController();
