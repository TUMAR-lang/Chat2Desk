$(document).ready(function() {
    var grecaptchaCommonLoginWidget;
    $("input[name='phone']").mask("+996 ddd dd dd dd");
    $("input[name='phone']").click(function() {
        if ($(this).length < 4) {
            $(this).get(0).setSelectionRange(5, 5);
        }
    });
    $("form .toggle-password").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        var input = $($(this).attr('toggle'));
        if (input.attr("type") === "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });
    let form__body = $(".form__body"),
        resetForm = $("#reset-password-form"),
        register = $(".chatRegister"),
        input = $("form input");
    $(".error").hide();
    $(".success").hide();
    $(".forgot-password").click(function() {
        form__body.hide();
        resetForm.fadeIn();
    });


    $(".tab-btn").click(function() {
        removeOnClick(input);
        $(".tab-btn").removeClass("active");
        $(this).addClass("active");
        var tab_id = $(this).attr('data-tab');
        $("#" + tab_id).fadeIn();
    });
    $("#cancel").click(function() {
        var tab_id = $(".tab-btn").attr('data-tab')
        $("#" + tab_id).fadeIn();
        resetForm.hide();
    })
    $(".form__input").keyup(function() {
        removeError($(this));
    });

    $("input[type='checkbox']").click(function() {
        $(".form__item").css("color", "#000");
    });

    function handleNonApiError(response) {
        switch (response.status) {
            case 500:
                return ('#internal-error').show();
        }
    }

    function handleFormErrors(formName, errors) {
        if (errors['session']) {
            alert('You have exceeded the maximum number of online operators. Contact your account administrator to log in')
        }

        function renderFieldErrors(fieldName, fieldErrors) {
            var fieldId = fieldName.includes('.') ? fieldName.replace('.', '_') : fieldName
            var errorClass = 'has-error';
            var container = $('#' + formName + '-' + fieldId + '-group');
            var errorsContainer = $('#' + formName + '-' + fieldId + '-errors');

            container.removeClass(errorClass);
            errorsContainer.empty();

            if (fieldErrors) {
                container.addClass(errorClass);
                fieldErrors.forEach(error => {
                    errorsContainer.append(
                        '<span class="field-error">' + error + '</span>'
                    )
                })
            }
        }

        Object.keys(errors).forEach(key => {
            var error = errors[key];

            if (error) {
                renderFieldErrors(key, error)
            }
        });
    }

    function nodesToArray(nodeList) {
        return Array.prototype.slice.call(nodeList)
    }

    function getFieldValue(formId, id) {
        return $('#' + formId + '-' + id).val()
    }

    function clearForm(formName) {
        var formGroups = $(formName + " " + 'input').val("");
        var fields = nodesToArray(formGroups);

        return fields.forEach(field => {
            $(field).removeClass('has-error')
            $(field).children('.field-errors-container').empty()
        })
    }
    $("#confirm_password").on('change', function() {
        removeError($(this));

        let regField = $(this).find("#reg_password").val();
        if ($(this).val() != regField) {
            $(this).parent().closest(".form__item").find(".error p").text("Пароли не совпадают");
            addError($(this));
        } else if (regField === $(this).val()) {
            removeError($(this));

        }
    });
    $("#register-form").submit(function(e) {
        e.preventDefault();
        let ths = $(this);
        let error = formValidate($(this));
        let password = $('#register-form #reg_password').val(),
            password_confirmation = $('#register-form #confirm_password').val(),
            company_name = $('#register-form #company_name').val(),
            email = $('#register-form #email').val(),
            first_name = $('#register-form #first_name').val(),
            phone = $('#register-form #phone').val().replace(/[ ]/g, '');
        if (password !== password_confirmation) {
            $("input[type='password']").parent().closest(".form__item").find(".error p").text("Пароли не совпадают");
            addError($("input[name='password']"));
        }
        if (error == 0) {
            $.ajax({
                method: 'POST',
                url: 'https://web.chat2desk.com/api/user/sign_up',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    "email": email,
                    "password": password,
                    "password_confirmation": password_confirmation,
                    "company_name": company_name,
                }),
                beforeSend: function() {
                    addEffect(ths);
                    $(".errorMesssage").hide();
                },
                success: function(response) {
                    if (response.status === 'success') {
                        console.log(response);
                        location.href =
                            'https://web.chat2desk.kg?auth_key=' + response.auth_key;
                        $.ajax({
                            method: "POST",
                            url: 'https://vtiger.crm.kg/tildaGetLeads.php',
                            data: {
                                name: first_name,
                                company: company_name,
                                Email: email,
                                Phone: phone
                            }
                        });
                    } else {
                        setTimeout(function() {
                            removeEffect(ths);
                            $(".errorMesssage").text(response);
                            $(".errorMesssage").fadeIn();
                        }, 2000);
                    }
                },
            });
        }

    });
    $("#login-submit").click(function(e) {
        e.preventDefault();
        let ths = $(this);
        let password = $("#password_login").val(),
            email = $("#email_login").val();
        let error = formValidate($("#login-form"));
        if (error == 0) {
            $.ajax({
                method: 'POST',
                url: 'https://web.chat2desk.kg/api/user/sign_in',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    "email": email,
                    "password": password,
                    "grecaptchaResponse": document.getElementById('g-recaptcha-response').hasChildNodes() ? grecaptcha.getResponse(grecaptchaCommonLoginWidget) : null
                }),
                beforeSend: function() {
                    addEffect(ths);
                    $(".errorMesssage").hide();
                },
                success: function(response) {
                    clearForm("form");
                    console.log(response);
                    if (response.status === 'success') {

                        location.href =
                            'https://web.chat2desk.kg?auth_key=' + response.auth_key;
                    } else {
                        setTimeout(function() {
                            removeEffect(ths);
                            $(".errorMesssage").text("Вы ввели неверные данные попробуйте еще раз");
                            $(".errorMesssage").fadeIn();
                        }, 2000);
                        console.log('Api error', response.errors);
                        try {
                            response.errors = JSON.parse(response.errors.brute_force[0])
                        } catch (e) {}
                        if (document.getElementById('g-recaptcha-response').hasChildNodes()) grecaptcha.reset(grecaptchaCommonLoginWidget)
                        var render_captcha = response.login_attempts_info !== null && (
                            response.login_attempts_info.failed_attempts_number >= response.login_attempts_info.max_attempts_number
                        ) && response.errors.reason === 'captcha'
                        try {
                            if (render_captcha) {
                                grecaptchaCommonLoginWidget = grecaptcha.render('g-recaptcha-response', { 'sitekey': '6LdRklYcAAAAAC1dL3cBLr-I2AB8VfkacnWkZjIA' });
                            }
                        } catch (e) {}
                        if (response.errors.reason !== undefined && response.errors.message !== null) {
                            // handleFormErrors(formID, { password: [response.errors.message] })
                        } else {
                            // handleFormErrors(formID, response.errors)
                        }
                    }
                },
            });

        } else {
            // console.log(error);
        }
    });
    $("#btn-demo").click(function(e) {
        e.preventDefault();
        $(this).css("background-color", "orange")
        $.ajax({
            method: 'POST',
            url: 'https://web.chat2desk.com/api/user/sign_up',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify({
                "demo_access": true
            }),
            success: function(response) {
                console.log(response.status);
                console.log(response);

                if (response.status === 'success') {
                    location.href =
                        'https://web.chat2desk.com?auth_key' + response.auth_key;
                    // console.log(response.auth_key);
                }
            }
        });
    });

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    $(".res").hide();
    var apiUrl = 'https://web.chat2desk.kg';
    var secretKey = getParameterByName('hash');
    if (secretKey) {
        $(".form").fadeOut(100);
        $(".res").show();
        $("#change-password-form #change-password-secret-key").val(secretKey)
    }
    $('#reset-password-form').submit(function(e) {
        e.preventDefault();
        let error = formValidate($("#reset-password-form"));
        let ths = $(this);
        $(".__resetPass").text("Введите это поле");
        if (error == 0) {
            $.ajax({
                method: 'POST',
                url: 'https://web.chat2desk.kg/api/user/reset_password',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    email: $('#forgot_pass').val(),
                    url_to_change_pwd: window.location.href,
                }),
                beforeSend: function() {
                    addEffect(ths);
                    $(".errorMesssage").hide();
                },
                success: function(response) {
                    if (response.status === 'success') {
                        setTimeout(function() {
                            removeEffect(ths);
                            register.hide();
                            $(".success").fadeIn();
                            $(".reset_pass_result").fadeIn();
                            $("#response_email").text(response.email);
                        }, 1500);
                    } else {
                        setTimeout(function() {
                            removeEffect(ths);
                            $(".errorMesssage").text('Такой E-mail не найден');
                            $(".errorMesssage").fadeIn();
                        }, 5000);
                    }
                },
            });
        }

    });


    $('#change-submit').click(function(e) {
        e.preventDefault();
        var formID = 'change-password';
        $("#change-password-errors").text("");
        alert(getFieldValue(formID, 'password'));
        $.ajax({
            method: 'POST',
            url: apiUrl + '/api/user/change_password',
            contentType: "application/json; charset=UTF-8",
            dataType: 'json',
            data: JSON.stringify({
                password: getFieldValue(formID, 'password'),
                password_confirmation: getFieldValue(formID, 'repeatPassword'),
                hash: getFieldValue(formID, 'secret-key')
            }),
            success: function(response) {
                console.log(response);
                if (response.status === 'success') {
                    location.href = apiUrl + '?auth_key=' + response.auth_key
                } else {
                    $("#change-password-errors").text(JSON.stringify(response.errors))
                    console.error('Api error', response.errors)
                    clearForm(formID);
                    handleFormErrors(formID, response.errors)
                }
            }
        });
    });
    $('.master-login').hide();
    $("body").keydown(function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 120) {
            $(".tab").hide();
            $("#login-form").hide();
            $("#register-form").hide();
            $("#chatRegister").fadeIn();
            $('.master-login').fadeIn(1000);
        }
    });
    $('#master-login-form').submit(function(e) {
        e.preventDefault();
        let ths = $(this);
        let error = formValidate($("#master-login-form"));
        let email = $("#master-login-form #email").val(),
            password = $("#master-login-form #password").val(),
            personal_email = $("#master-login-form #personal-email").val(),
            personal_password = $("#master-login-form #personal-password").val();
        if (error == 0) {
            $.ajax({
                method: 'POST',
                url: 'https://web.chat2desk.kg/api/user/master_sign_in',
                contentType: "application/json; charset=UTF-8",
                dataType: 'json',
                data: JSON.stringify({
                    "email": email,
                    "password": password,
                    "personal_email": personal_email,
                    "personal_password": personal_password,
                }),
                beforeSend: function() {
                    addEffect(ths);
                    $(".errorMesssage").hide();
                },
                success: function(response) {
                    console.log(response);
                    if (response.status === 'success') {
                        clearForm("form");
                        location.href =
                            'https://web.chat2desk.kg?auth_key=' + response.auth_key;
                        removeEffect(ths);
                    } else {
                        setTimeout(function() {
                            removeEffect(ths);
                            $(".errorMesssage").text(response);
                            $(".errorMesssage").fadeIn();
                        }, 2000);
                    }
                },
            });
        }
    });

    function formValidate(input) {
        let error = 0;
        let formReq = $(input).find("._req");
        let warrning = "Укажите допустимый e-mail";
        let req = "Это обязательное поле";
        Array.prototype.forEach.call(formReq, elm => {
            removeError(elm);
            let errMessage = $(".__req");
            if (elm.classList.contains("_email")) {
                if (elm.value == "") {
                    $(".__Emailreq").text(req);
                    addError(elm);
                    error++;
                } else if (!isEmail(elm.value)) {
                    $(".__Emailreq").text("");
                    $(".__Emailreq").text(warrning);
                    addError(elm);
                }
            } else if (elm.getAttribute("type") == "checkbox" && elm.checked == false) {
                elm.parentElement.style.color = "red";
            } else {
                if (elm.value == "") {
                    errMessage.html(req);
                    addError(elm);
                    error++;
                }
            }
        });
        return error;
    }

    function addEffect(item) {
        item.parent().closest('.chatRegister__body').addClass("_sending")
    }

    function removeEffect(item) {
        item.parent().closest('.chatRegister__body').removeClass("_sending")
    }

    function removeOnClick(input) {
        removeError(input);
        resetForm.hide();
        form__body.hide();
        $(".form__item").css("color", "#000")
        $("#data").css("color", "#000");
    }

    function addError(input) {
        $(input).parent().closest('.form__item').find(".error").show(500)
    }

    function removeError(input) {
        $(input).parent().closest('.form__item').find(".error").hide();
    }

    function isEmail(email) {
        var EmailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return EmailRegex.test(email);
    }
});
$(document).ready(function() {
    $(".close").click(function() {
        $("#chatRegister").fadeOut();
    });
});


// #283cfa
// $(function() {
//     $('#register-form').submit(function(e) {
//         e.preventDefault();
//         $.ajax({
//             method: 'POST',
//             url: 'https://web.chat2desk.com/api/user/sign_up',
//             contentType: 'application/json; charset=UTF-8',
//             dataType: 'json',
//             data: JSON.stringify({
//                 company_name: $('#register-form #name').val(),
//                 email: $('#register-form #email').val(),
//                 phone: $('#register-form #phone').val(),
//                 password: $('#register-form #password').val(),
//                 password_confirmation: $(
//                     '#register-form #confirm_password'
//                 ).val(),
//             }),
//             success: function(response) {
//                 if (response.status === 'success') {
//                     location.href =
//                         'https://web.chat2desk.kg?auth_key=' + response.auth_key;
//                 } else {
//                     alert(
//                         'Ошибка, введите верные данные либо такая компания уже зарегистрировано либо такой пользователь уже существует! '
//                     );
//                 }
//             },
//         });
//     });
// });
// $(function() {
//     $('.masterAUTH').on('click', function() {
//         $.ajax({
//             method: 'POST',
//             url: 'https://web.chat2desk.kg/api/user/master_sign_in',
//             contentType: 'application/json; charset=UTF-8',
//             dataType: 'json',
//             data: JSON.stringify({
//                 email: $('#email1').val(),
//                 password: $('#pass1').val(),
//                 personal_email: $('#email2').val(),
//                 personal_password: $('#pass2').val(),
//             }),
//             error: function(err) {
//                 alert('Ошибка');
//                 console.error('Internal', err);
//             },
//             success: function(response) {
//                 console.log(response);
//                 var masterURL = 'https://web.chat2desk.kg';
//                 if (response.status === 'success') {
//                     location.href = masterURL + '?auth_key=' + response.auth_key;
//                 } else {
//                     alert('Ошибка');
//                     console.error('Api error', response.errors);
//                     // clearForm(formID)
//                     // $('#internal-error').hide();
//                     // handleFormErrors(formID, response.errors)
//                 }
//             },
//         });
//     });
//     $('#login-form').submit(function(e) {
//         //GO
//         e.preventDefault();
//         $.ajax({
//             method: 'POST',
//             url: 'https://web.chat2desk.com/api/user/sign_in',
//             contentType: 'application/json; charset=UTF-8',
//             dataType: 'json',
//             data: JSON.stringify({
//                 email: $('#email_login').val(),
//                 password: $('#password_login').val(),
//             }),
//             success: function(response) {
//                 if (response.status === 'success') {
//                     location.href =
//                         'https://web.chat2desk.kg?auth_key=' + response.auth_key;
//                 } else {
//                     alert('Ошибка, введит верные данные!');
//                 }
//             },
//         });
//     });
// }); });
// });     });
//     });
// }); });
// });