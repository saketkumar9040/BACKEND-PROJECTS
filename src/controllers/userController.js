const usermodel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const {
  isValid,
  isValidBody,
  isValidName,
  isValidMail,
  isValidImg,
  isValidPh,
  isValidPassword,
  comparePw,
  isValidPincode,
  securepw,
  isValidObjectId,
} = require("../validation/validation");
const { uploadFile } = require("../aws/aws");

//—————————————————————————————————————————[  Register User  ]————————————————————————————————————————————————————

const createUser = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body));

    if (isValidBody(data))
      return res
        .status(400)
        .send({ status: false, message: "Body Should not be empty" });
    let files = req.files;
    let { fname, lname, email, phone, password, address, profileImage } = data;
    let arr = ["fname", "lname", "email", "phone", "password", "address"];
    for (let i = 0; i < arr.length; i++) {
      if (!(arr[i] in data)) {
        return res
          .status(400)
          .send({ status: false, message: `${arr[i]} is required` });
      }
    }

    if (!isValid(fname))
      return res
        .status(400)
        .send({ status: false, message: "fname shouldnot be empty" });
    if (!isValidName(fname))
      return res
        .status(400)
        .send({ status: false, message: "Pls Enter Valid First Name" });
    if (!isValid(lname))
      return res
        .status(400)
        .send({ status: false, message: "lname shouldnot be empty" });
    if (!isValidName(lname))
      return res
        .status(400)
        .send({ status: false, message: "Pls Enter Valid Last Name" });
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, message: "email shouldnot be empty" });
    if (!isValidMail(email.trim()))
      return res
        .status(400)
        .send({ status: false, message: "Pls enter EmailId in Valid Format" });

    if (!isValid(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone shouldnot be empty" });
    if (!isValidPh(phone.trim()))
      return res.status(400).send({
        status: false,
        message: "Phone No.Should be valid INDIAN no.",
      });
    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, message: "password shouldnot be empty" });
    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message:
          "Password must be in 8-15 characters long and it should contains 1 Upper 1 lower 1 digit and 1 special character atleast",
      });
    //——————————————————————————————=>)  Address Validations  (<=—————————————————————————————————————
    if (typeof address === "string")
      return res
        .status(400)
        .send({ status: false, message: "Address should be an Object" });
    if (typeof address === "object") {
      if (isValidBody(address))
        return res
          .status(400)
          .send({ status: false, message: "Address Should not be empty" });
      if (!("shipping" in address))
        return res
          .status(400)
          .send({ status: false, message: "Shipping is required in address" });
      if (typeof address.shipping === "string")
        return res.status(400).send({
          status: false,
          message: "Shipping in Address Should be an object",
        });
      if (isValidBody(address.shipping))
        return res
          .status(400)
          .send({ status: false, message: "Shipping Should not be empty" });

      let required = ["street", "city", "pincode"];
      for (let i = 0; i < required.length; i++) {
        if (!(required[i] in address.shipping))
          return res.status(400).send({
            status: false,
            message: `${required[i]} is required in Shipping`,
          });
      }

      if (!isValid(address.shipping.street))
        return res.status(400).send({
          status: false,
          message: "Street should not be empty in Shipping",
        });
      data.address.shipping.street = address.shipping.street
        .split(" ")
        .filter((e) => e)
        .join(" ");
      if (!isValid(address.shipping.city))
        return res.status(400).send({
          status: false,
          message: "city should not be empty in shipping",
        });
      if (!isValidName(address.shipping.city))
        return res.status(400).send({
          status: false,
          message: "Pls Enter Valid City Name in Shipping",
        });
      if (!isValid(address.shipping.pincode))
        return res.status(400).send({
          status: false,
          message: "Pincode should not be empty in shipping",
        });
      if (!isValidPincode(address.shipping.pincode))
        return res.status(400).send({
          status: false,
          message: "Pls Enter Valid PAN PINCODE in Shipping",
        });
      //——————————————————————————————>)  Address Billing Validations  (<——————————————————————————————
      if (!("billing" in address))
        return res
          .status(400)
          .send({ status: false, message: "Billing Is required in address" });
      if (typeof address.billing === "string")
        return res
          .status(400)
          .send({ status: false, message: "billing should be an Object" });
      if (isValidBody(address.billing))
        return res
          .status(400)
          .send({ status: false, message: "Billing Should not be empty" });

      let required1 = ["street", "city", "pincode"];
      for (let i = 0; i < required1.length; i++) {
        if (!(required1[i] in address.billing))
          return res.status(400).send({
            status: false,
            message: `${required1[i]} is required in Billing`,
          });
      }

      if (!isValid(address.billing.street))
        return res.status(400).send({
          status: false,
          message: "Street should not be empty in Billing",
        });
      data.address.billing.street = address.billing.street
        .split(" ")
        .filter((e) => e)
        .join(" ");
      if (!isValid(address.billing.city))
        return res.status(400).send({
          status: false,
          message: "city should not be empty in Billing",
        });
      if (!isValidName(address.billing.city))
        return res.status(400).send({
          status: false,
          message: "Pls Enter Valid City Name in Billing",
        });
      if (!isValid(address.billing.pincode))
        return res.status(400).send({
          status: false,
          message: "Pincode should not be empty in Billing",
        });
      if (!isValidPincode(address.billing.pincode))
        return res.status(400).send({
          status: false,
          message: "Pls Enter Valid PAN PINCODE in Billing",
        });
    }

    if (await usermodel.findOne({ email }))
      return res
        .status(400)
        .send({ status: false, message: `${email} is already exists` });
    if (await usermodel.findOne({ phone }))
      return res
        .status(400)
        .send({ status: false, message: `${phone} is already exists` });

    data.password = await securepw(data.password);
    if (files && files.length > 0) {
      if (!isValidImg(files[0].mimetype)) { //  MULTIPURPOSE INTERNET MAIL EXTENSIONS
        return res.status(400).send({
          status: false,
          message: "Image Should be of JPEG/ JPG/ PNG",
        });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;

      let saveddata = await usermodel.create(data);
      res
        .status(201)
        .send({ status: true, message: "Success", data: saveddata });
    } else {
      res
        .status(400)
        .send({ status: false, message: "profileImage is Required" });
    }
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
//—————————————————————————————————————————[  Login User  ]————————————————————————————————————————————————————
const loginUser = async (req, res) => {
  try {
    let data = req.body;
    if (isValidBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Body Should Not Be Empty " });
    }
    let { password, email } = data;
    if (!("email" in data))
      return res
        .status(400)
        .send({ status: false, message: "Email Is Required" });
    if (!("password" in data))
      return res
        .status(400)
        .send({ status: false, message: "Password Is Required" });

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email Id Cannot Be Empty" });
    }
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: " Password Cannot Be Empty" });
    }

    let user = await usermodel
      .findOne({ email: email })
      .select({ password: 1, _id: 1, email: 1 });
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "This Email Id Doesn't Exists" });
    }

    if (!(await comparePw(password, user.password))) {
      return res
        .status(401)
        .send({ status: false, message: "Invalid Credentials " });
    }

    let token = jwt.sign({ userId: user._id.toString() }, "project5@sss123", {
      expiresIn: "30m",
    });

    res.status(200).send({
      status: true,
      message: "User login successfull",
      data: {
        userId: user._id,
        token: token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};

//—————————————————————————————————————————[  Get User By UserId  ]———————————————————————————————————————————————
const getUser = async function (req, res) {
  try {
    let data = req.params.userId;

    if (!isValidObjectId(data))
      return res
        .status(400)
        .send({ status: false, message: "Given id format is invalid" });
    let findParams = await usermodel.findById(data);
    if (!findParams)
      return res
        .status(404)
        .send({ status: false, message: "We couldn't find data by given id" });

    res.status(200).send({ status: true, message: findParams });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//—————————————————————————————————————————[  Update User  ]————————————————————————————————————————————————————
const updateUser = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Given id format is invalid" });
    let user = await usermodel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "We couldn't find data by given id" });
    let files = req.files;
    let data = req.body;
    const { fname, lname, email, phone, password, address, profileImage } =
      data;

    if (files && files.length > 0) {
      if (!isValidImg(files[0].mimetype)) {
        return res.status(400).send({
          status: false,
          message: "Image Should be of JPEG/ JPG/ PNG",
        });
      }
      let uploadedFileURL = await uploadFile(files[0]);
      user.profileImage = uploadedFileURL;
    }
    if (!files) {
      if (isValidBody(data))
        return res.status(400).send({
          status: false,
          message: "Please enter some field for Upatation",
        });
    }

    if ("fname" in data) {
      if (!isValid(fname))
        return res
          .status(400)
          .send({ status: false, message: "fname shouldnot be empty" });
      if (!isValidName(fname))
        return res
          .status(400)
          .send({ status: false, message: "Pls Enter Valid First Name" });
      user.fname = fname;
    }

    if ("lname" in data) {
      if (!isValid(lname))
        return res
          .status(400)
          .send({ status: false, message: "lname shouldnot be empty" });
      if (!isValidName(lname))
        return res
          .status(400)
          .send({ status: false, message: "Pls Enter Valid Last Name" });
      user.lname = lname;
    }

    if ("email" in data) {
      if (!isValid(email))
        return res
          .status(400)
          .send({ status: false, message: "email shouldnot be empty" });
      if (!isValidMail(email))
        return res.status(400).send({
          status: false,
          message: "Pls enter EmailId in Valid Format",
        });
      if (await usermodel.findOne({ email: email }))
        return res
          .status(400)
          .send({ status: false, message: `${email} is already exists` });
      user.email = email;
    }

    if ("phone" in data) {
      if (!isValid(phone))
        return res
          .status(400)
          .send({ status: false, message: "phone shouldnot be empty" });
      if (!isValidPh(phone))
        return res.status(400).send({
          status: false,
          message: "Phone No.Should be valid INDIAN no.",
        });
      if (await usermodel.findOne({ phone: phone }))
        return res
          .status(400)
          .send({ status: false, message: `${phone} is already exists` });
      user.phone = phone;
    }

    if ("password" in data) {
      if (!isValid(password))
        return res
          .status(400)
          .send({ status: false, message: "password shouldnot be empty" });
      if (!isValidPassword(password))
        return res.status(400).send({
          status: false,
          message:
            "Password must be in 8-15 characters long and it should contains 1 Upper 1 lower 1 digit and 1 special character atleast",
        });
      let pass = await usermodel.findById(userId);
      let duplicate = await comparePw(password, pass.password);
      if (duplicate)
        return res.status(400).send({
          status: false,
          message: "You cannot use the previously used password",
        });
      let secure = await securepw(password);
      user.password = secure;
    }

    //——————————————————————————————>)  Address Validations  (<——————————————————————————————
    if ("address" in data) {
      if (typeof address === "string")
        return res
          .status(400)
          .send({ status: false, message: "Address should be an Object" });
      if (typeof address === "object") {
        if (!("shipping" in address) && !("billing" in address))
          return res.status(400).send({
            status: false,
            message: "Pls Provide Atleast Billing And Shipping to update",
          });
        const { shipping, billing } = data.address;
        if ("shipping" in address) {
          if (typeof shipping === "string")
            return res
              .status(400)
              .send({ status: false, message: "Shipping should be an Object" });
          if (typeof address.shipping === "object") {
            if (
              !("street" in shipping) &&
              !("city" in shipping) &&
              !("pincode" in shipping)
            )
              return res.status(400).send({
                status: false,
                message:
                  "Pls Provide Anyone ('STREET','CITY','PINCODE') in Shipping to update",
              });
            const { street, city, pincode } = shipping;
            if ("street" in shipping) {
              if (!isValid(street))
                return res.status(400).send({
                  status: false,
                  message: "Street Should Not Be empty",
                });
              user.address.shipping.street = street
                .split(" ")
                .filter((e) => e)
                .join(" ");
            }
            if ("city" in shipping) {
              if (!isValid(city))
                return res
                  .status(400)
                  .send({ status: false, message: "City Should not be empty" });
              if (!isValidName(city))
                return res.status(400).send({
                  status: false,
                  message: "Pls Enter Valid city name",
                });
              user.address.shipping.city = city;
            }
            if ("pincode" in shipping) {
              if (!isValid(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Pincode should not be empty",
                });
              if (!isValidPincode(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Enter a valid Indian Pincode",
                });
              user.address.shipping.pincode = pincode;
            }
          }
        }
        if ("billing" in address) {
          if (typeof billing === "string")
            return res
              .status(400)
              .send({ status: false, message: "Billing Should be an object" });
          if (typeof billing === "object") {
            if (
              !("street" in billing) &&
              !("city" in billing) &&
              !("pincode" in billing)
            )
              return res.status(400).send({
                status: false,
                message:
                  "Pls Provide Anyone ('STREET','CITY','PINCODE') in Billing to update",
              });
            const { street, city, pincode } = billing;
            if ("street" in billing) {
              if (!isValid(street))
                return res.status(400).send({
                  status: false,
                  message: "Street in Billing Should Not Be empty",
                });
              user.address.billing.street = street
                .split(" ")
                .filter((e) => e)
                .join(" ");
            }
            if ("city" in billing) {
              if (!isValid(city))
                return res.status(400).send({
                  status: false,
                  message: "City in Billing Should not be empty ",
                });
              if (!isValidName(city))
                return res.status(400).send({
                  status: false,
                  message: "Pls Enter Valid city name in Billing",
                });
              user.address.billing.city = city;
            }
            if ("pincode" in billing) {
              if (!isValid(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Pincode in Billing should not be empty",
                });
              if (!isValidPincode(pincode))
                return res.status(400).send({
                  status: false,
                  message: "Enter Pan Pincode in Billing",
                });
              user.address.billing.pincode = pincode;
            }
          }
        }
      }
    }
    user.save();
    return res
      .status(200)
      .send({ status: true, message: "updated Successfully", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

//—————————————————————————————————————————[  route not found  ]————————————————————————————————————————————————————

const notFound = async function (req, res) {
  res.status(404).send({ status: false, message: "Route not found" });
};

module.exports = { createUser, loginUser, getUser, updateUser, notFound };
