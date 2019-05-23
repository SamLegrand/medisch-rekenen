$(document).ready(function(){

    $('#LoginForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/login',
            data: {
                "username": $('input[name="username"]').val(),
                "email": $('input[name="email"]').val()
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "ErrorUser") {
                    $("#userError").slideDown();
                }
                else if (response.Status === "Success") {
                    window.location.href = '/evaluation';
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    
    $('#AdminForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/login',
            data: {
                "username": 'admin',
                "password": $('input[name="password"]').val()
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "ErrorPass") {
                    $("#passError").slideDown();
                }
                else if (response.Status === "Success") {
                    window.location.href = '/admin';
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    
    $('#adminLogin').on('click', function(e) {
        $('#LoginForm').slideUp();
        $('#AdminForm').slideDown();
    });
    
    $('#studentLogin').on('click', function(e) {
        $('#AdminForm').slideUp();
        $('#LoginForm').slideDown();
    });
    
    $('.delete-score').on('click', function(e) {
        let info = $(this).attr('value').split('-');
        
        let confirmation = confirm("Weet u zeker dat u deze score wilt verwijderen?");
        if (confirmation) {
            $.ajax({
            url: '/api/delete_score',
            data: {
                "year": info[0],
                "username": info[1]
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    location.reload();
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
        }
    });
    
    $('.delete-failed').on('click', function (e) {
        let year = $(this).attr('value');
        let users = new Array();
        $('#year' + year).find('.row').each(function (e) {
            let score = $(this).find('.col-3 p').text().split('/');
            let minimum = Math.ceil(0.5 * score.pop());
            if (score[0] >= minimum) {
                users.push($(this).find('.username p').text());
            }
        });
        if (users.length === 0) {
            return;
        }
        
        let confirmation = confirm("Weet u zeker dat u niet geslaagde studenten wilt verwijderen?");
        if (confirmation) {
            $.ajax({
            url: '/api/delete_failed',
            data: {
                "year": $(this).attr('value'),
                "users": users
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    location.reload();
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
        }
    });
});
