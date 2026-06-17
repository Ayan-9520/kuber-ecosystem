"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCode = exports.KycStatus = exports.PartnerTypeCode = exports.ApplicationStatus = exports.LeadGrade = exports.LoginMethod = exports.OtpPurpose = exports.DataScope = exports.UserStatus = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["CUSTOMER"] = "CUSTOMER";
    UserType["EMPLOYEE"] = "EMPLOYEE";
    UserType["PARTNER"] = "PARTNER";
    UserType["ADMIN"] = "ADMIN";
})(UserType || (exports.UserType = UserType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["LOCKED"] = "LOCKED";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var DataScope;
(function (DataScope) {
    DataScope["OWN"] = "OWN";
    DataScope["ASSIGNED"] = "ASSIGNED";
    DataScope["BRANCH"] = "BRANCH";
    DataScope["REGION"] = "REGION";
    DataScope["ORGANIZATION"] = "ORGANIZATION";
})(DataScope || (exports.DataScope = DataScope = {}));
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["LOGIN"] = "LOGIN";
    OtpPurpose["REGISTER"] = "REGISTER";
    OtpPurpose["VERIFY_PHONE"] = "VERIFY_PHONE";
    OtpPurpose["CHANGE_MOBILE"] = "CHANGE_MOBILE";
    OtpPurpose["RESET_PASSWORD"] = "RESET_PASSWORD";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
var LoginMethod;
(function (LoginMethod) {
    LoginMethod["OTP"] = "OTP";
    LoginMethod["PASSWORD"] = "PASSWORD";
})(LoginMethod || (exports.LoginMethod = LoginMethod = {}));
var LeadGrade;
(function (LeadGrade) {
    LeadGrade["A_PLUS"] = "A_PLUS";
    LeadGrade["A"] = "A";
    LeadGrade["B"] = "B";
    LeadGrade["C"] = "C";
    LeadGrade["REJECTED"] = "REJECTED";
})(LeadGrade || (exports.LeadGrade = LeadGrade = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "DRAFT";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["IN_REVIEW"] = "IN_REVIEW";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["DISBURSED"] = "DISBURSED";
    ApplicationStatus["CLOSED"] = "CLOSED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var PartnerTypeCode;
(function (PartnerTypeCode) {
    PartnerTypeCode["DSA"] = "DSA";
    PartnerTypeCode["REFERRAL"] = "REFERRAL";
    PartnerTypeCode["BUILDER"] = "BUILDER";
    PartnerTypeCode["CA"] = "CA";
})(PartnerTypeCode || (exports.PartnerTypeCode = PartnerTypeCode = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["NOT_STARTED"] = "NOT_STARTED";
    KycStatus["IN_PROGRESS"] = "IN_PROGRESS";
    KycStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    KycStatus["VERIFIED"] = "VERIFIED";
    KycStatus["REJECTED"] = "REJECTED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var ProductCode;
(function (ProductCode) {
    ProductCode["PL"] = "PL";
    ProductCode["HL"] = "HL";
    ProductCode["LAP"] = "LAP";
    ProductCode["BL"] = "BL";
    ProductCode["AL"] = "AL";
    ProductCode["CC"] = "CC";
})(ProductCode || (exports.ProductCode = ProductCode = {}));
//# sourceMappingURL=index.js.map