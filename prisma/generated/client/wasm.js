
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.0.1
 * Query Engine version: 5dbef10bdbfb579e07d35cc85fb1518d357cb99e
 */
Prisma.prismaVersion = {
  client: "6.0.1",
  engine: "5dbef10bdbfb579e07d35cc85fb1518d357cb99e"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  email: 'email',
  password: 'password',
  avatar: 'avatar',
  isVerify: 'isVerify',
  ref_code: 'ref_code',
  referred_by: 'referred_by',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.User_PointScalarFieldEnum = {
  id: 'id',
  point: 'point',
  createdAt: 'createdAt',
  expiredAt: 'expiredAt',
  isRedeem: 'isRedeem',
  userId: 'userId'
};

exports.Prisma.User_CouponScalarFieldEnum = {
  id: 'id',
  isRedeem: 'isRedeem',
  percentage: 'percentage',
  createdAt: 'createdAt',
  expiredAt: 'expiredAt',
  userId: 'userId'
};

exports.Prisma.PromotorScalarFieldEnum = {
  id: 'id',
  username: 'username',
  email: 'email',
  password: 'password',
  avatar: 'avatar',
  isVerify: 'isVerify',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  thumbnail: 'thumbnail',
  description: 'description',
  terms: 'terms',
  category: 'category',
  location: 'location',
  venue: 'venue',
  date: 'date',
  time: 'time',
  createdAt: 'createdAt',
  promotorId: 'promotorId'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  category: 'category',
  seats: 'seats',
  price: 'price',
  isFree: 'isFree',
  createdAt: 'createdAt',
  eventId: 'eventId'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  total_price: 'total_price',
  final_price: 'final_price',
  status: 'status',
  createdAt: 'createdAt',
  userId: 'userId',
  eventId: 'eventId',
  payment_proof: 'payment_proof'
};

exports.Prisma.Order_DetailsScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  qty: 'qty',
  orderId: 'orderId'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  description: 'description',
  rating: 'rating',
  userId: 'userId',
  eventId: 'eventId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.EventCategory = exports.$Enums.EventCategory = {
  Konser: 'Konser',
  Seminar: 'Seminar',
  Olahraga: 'Olahraga',
  Expo: 'Expo'
};

exports.EventLocation = exports.$Enums.EventLocation = {
  Bandung: 'Bandung',
  Jakarta: 'Jakarta',
  Surabaya: 'Surabaya',
  Bali: 'Bali'
};

exports.TicketCategory = exports.$Enums.TicketCategory = {
  Free: 'Free',
  EarlyBird: 'EarlyBird',
  Regular: 'Regular',
  VIP: 'VIP'
};

exports.StatusOrder = exports.$Enums.StatusOrder = {
  Pending: 'Pending',
  Paid: 'Paid',
  Cancel: 'Cancel'
};

exports.Prisma.ModelName = {
  User: 'User',
  User_Point: 'User_Point',
  User_Coupon: 'User_Coupon',
  Promotor: 'Promotor',
  Event: 'Event',
  Ticket: 'Ticket',
  Order: 'Order',
  Order_Details: 'Order_Details',
  Review: 'Review'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
