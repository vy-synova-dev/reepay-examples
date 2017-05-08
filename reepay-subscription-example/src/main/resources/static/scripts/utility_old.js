/**
 * This util requires that texts.js is included in the HTML document as well, as it's used to translate various error messages
 * @param {string} valSettings
 */
function ReepayUtils(valSettings) {
    var self = this;
    /**
     * Settings which can extend/overwrite defaults by parsing an object as a parameter. See the HTML for example
     * Everything but the functions in the return block is private
     */
    self.settings = {
        cvvId: "#cvv",
        cardnumberId: "#cardnumber",
        expiryId: "#expiry",
        inputClass: ".customer_info",
        submitButtonId: "#savebutton",
        termsId: "#terms",
        formId: "#paymentform",
        couponId: "#coupon",
        checkEmail: true,
        submitProcess: false,
        locale: "en_GB"
    };
    $.extend(self.settings, valSettings);

    /**
     * Validating that all required input fields are filled out
     */
    self.validateInput = function(inputName) {
        $(inputName).each(function() {
            if ($(this).attr('required')) {

                $(this).blur(function() {

                    if ($(this).val() == "") {
                        $(this).parent().removeClass("has-success");
                        $(this).parent().addClass("has-error");
                    } else {
                        $(this).parent().removeClass("has-error");
                        $(this).parent().addClass("has-success");
                    }

                });

            }
        });
    }

    /**
     * Check if the email fits the standard emai format
     * @param {string} email
     * @returns {boolean}
     */
    self.isEmail = function(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    /**
     *  Validate that the customer info fields has been filled out
     * @returns {boolean}
     */
    self.validateCustomer = function(inputName) {
        var status = true;

        $(inputName).each(function() {

            if ($(this).attr('required')) {
                if ($(this).val() == "") {
                    console.log($(this).attr("name") + " is empty");
                    status = false;
                    return;
                }
            }

            if ($(this).attr("name") == "email" && !self.isEmail($(this).val())) {
                console.log($(this).attr("name") + " is not valid");
                status = false;
                return;
            }
        });
        return status;
    }

    /**
     * Constructs the customer object based on the inputs in the form
     * @returns {Object}
     */
    self.getCustomer = function(inputName) {
        console.log(inputName);
        var customer = {};

        $(".customer_info").each(function() {
            customer[$(this).attr("name")] = $(this).val();
        });

        return customer;
    }

    /**
     * Card number validation on HTML fields
     */
    self.validateCardnumber = function(cardnumberId) {
        $(cardnumberId).blur(function() {
            $('#error').hide();
            if (!reepay.validate.cardNumber($(cardnumberId).val())) {
                // This can be changed to how you wish to do with the validation of the cardnumberId

                if ($('#form-group-cardnumber').hasClass("has-success")) {
                    $('#form-group-cardnumber').toggleClass("has-success");
                }
                if (!$('#form-group-cardnumber').hasClass("has-error")) {
                    $('#form-group-cardnumber').toggleClass("has-error");
                }
            } else {
                if ($('#form-group-cardnumber').hasClass("has-error")) {
                    $('#form-group-cardnumber').toggleClass("has-error");
                }
                if (!$('#form-group-cardnumber').hasClass("has-success")) {
                    $('#form-group-cardnumber').toggleClass("has-success");
                }
            }
        });
    };

    /**
     * Expiry validation on HTML fields
     */
    self.validateExpiry = function(expiryId) {
        $(expiryId).blur(function() {
            var exp = $(expiryId).val().replace(/\s/g, '').split("/");
            if (!reepay.validate.expiry(exp[0], exp[1])) {
                // This can be chamged to how you wish to do with the validation of the cardnumberId
                if ($('#form-group-exp').hasClass("has-success")) {
                    $('#form-group-exp').toggleClass("has-success");
                }
                if (!$('#form-group-exp').hasClass("has-error")) {
                    $('#form-group-exp').toggleClass("has-error");
                }
            } else {
                if ($('#form-group-exp').hasClass("has-error")) {
                    $('#form-group-exp').toggleClass("has-error");
                }
                if (!$('#form-group-exp').hasClass("has-success")) {
                    $('#form-group-exp').toggleClass("has-success");
                }
            }
        });
    };

    /**
     * CVV validation on HTML fields
     */
    self.validateCvv = function(cvvId) {
        $(cvvId).blur(function() {
            if (!reepay.validate.cvv($(cvvId).val())) {
                // This can be changed to how you wish to do with the validation of the cardnumberId
                if ($('#form-group-cvc').hasClass("has-success")) {
                    $('#form-group-cvc').toggleClass("has-success");
                }
                if (!$('#form-group-cvc').hasClass("has-error")) {
                    $('#form-group-cvc').toggleClass("has-error");
                }
            } else {
                if ($('#form-group-cvc').hasClass("has-error")) {
                    $('#form-group-cvc').toggleClass("has-error");
                }
                if (!$('#form-group-cvc').hasClass("has-success")) {
                    $('#form-group-cvc').toggleClass("has-success");
                }
            }
        });
    }

    /**
     * Validates if the terms has been checked.
     */
    self.validateTerms = function(termsId) {
        $(termsId).change(function() {
            // Check if terms has been accepted. This can be changed to how you wish to handle the errors. 
            if (this.checked) {
                $("#terms-group").removeClass("has-error");
                $("#terms-group").addClass("has-success");
            } else {
                $("#terms-group").removeClass("has-success");
                $("#terms-group").addClass("has-error");
            }
        });
    }

    /**
     * The public validate function
     */
    self.validate = function(settings) {
        self.validateInput(settings.inputClass);
        self.validateCardnumber(settings.cardnumberId);
        self.validateExpiry(settings.expiryId);
        self.validateCvv(settings.cvvId);
        self.validateTerms(settings.termsId);
    }

    /**
     * Generates a token. If a custom function is defined, it will use that to handle the returned token.
     * @param {Object} paymentInfo
     * @param {customTokenFunction} customTokenFunction
     */
    self.getToken = function(settings, paymentInfo, customTokenFunction) {
        reepay.token(paymentInfo, function(err, token) {
            // Handle token error and success here. This is just an example.
            // Should be changed to suit your needs and your HTML.
            if (err) {
                console.log("An error happened: code: " + err.code + " message: " + err.message);
                var errText = interpretError(err, settings.locale);
                var headline = errText.headline;
                var message = errText.message;

                $('#error_headline').html(headline);
                if (err.fields) {
                    message = message + err.fields;
                }
                $('#error_message').html(message);
                $('#error').show();
                $(settings.submitButtonId).button('reset');
            } else if (customTokenFunction == undefined) {
                $("[data-reepay=token]").val(token.id);
                $(settings.formId).submit();
            } else {
                objects = {
                    customer: self.customer,
                }
                customTokenFunction(objects, token);
            }
        });
    }

    /**
     * Creates a customer from the specified settings
     * @param {Object} settings
     * @param {customTokenFunction} customTokenFunction
     */
    self.createCustomer = function(settings, customTokenFunction) {

        $(settings.submitButtonId).on('click', function(event) {
            event.preventDefault();
            // Validate Customer
            if (!self.validateCustomer(settings.inputClass)) {
                // Show some kind of error here
                $('#customer_error_headline').html("Wrong information");
                $('#customer_error_message').html("Please fill in correct information");
                $("#customer_error").show();
                return;
            }


            self.customer = self.getCustomer(settings.inputClass);
            $("#customer_error").hide();

            var exp = $(settings.expiryId).val().replace(/\s/g, '').split("/");

            // alternatively..
            var paymentinfo = {
                // TODO: the name must be cardnumber not only number. Server supports number fix.
                number: $(settings.cardnumberId).val(),
                month: exp[0],
                year: exp[1],
                cvv: $(settings.cvvId).val()
            };
            reepay.validate.cardNumber(paymentinfo['number']);

            $(settings.submitButtonId).button('loading');
            self.getToken(settings, paymentinfo, customTokenFunction);
        });
    };


    /**
     * Checks if a coupon is valid. Builds the coupon object to send in a custom function
     * @param {string} couponId
     * @param {validationFunction} validationFunction
     */
    self.couponCheck = function(couponId, validationFunction) {
        $(couponId).on('blur', function(event) {
            var coupon = {
                code: $(couponId).val()
            }

            if (validationFunction == undefined) {
                console.error("A validation function for the coupon field is required");
            } else {
                validationFunction(coupon);
            }
        });
    }

    /**
     * Updates the card information for the customer
     */
    self.updateCard = function(settings, updateCardFunction) {
        $(settings.submitButtonId).on('click', function(event) {
            event.preventDefault();
            if ($(settings.termsId) != undefined && !$(settings.termsId)[0].checked) {
                $("#terms-group").addClass("has-error");

                $('#error_headline').html("Accepter betingelser");
                $('#error_message').html("Du skal huske at accepterer betingelserne.");
                $('#error').show();

                $(settings.submitButtonId).button('reset');
                return;
            }
            var exp = $("#expiry").val().replace(/\s/g, '').split("/");
            var paymentinfo = {
                // TODO: the name must be cardnumber not only number. Server supports number fix.
                number: $(settings.cardnumberId).val(),
                month: exp[0],
                year: exp[1],
                cvv: $(settings.cvvId).val()
            };
            reepay.validate.cardNumber(paymentinfo['number']);
            $(settings.submitButtonId).button('loading');
            self.getToken(settings, paymentinfo, updateCardFunction);
        });
    }



    // Public to call
    return {
        // Validates input with the given settings in the constructor
        validate: function() {
            self.validate(self.settings);
        },
        createCustomer: function(customTokenFunction) {
            self.createCustomer(self.settings, customTokenFunction);
        },
        coupon: function(validationFunction) {
            self.couponCheck(self.settings.couponId, validationFunction);
        },
        updateCard: function(updateCardFunction) {
            self.updateCard(self.settings, updateCardFunction);
        },
        repSettings: self.settings
    }
}