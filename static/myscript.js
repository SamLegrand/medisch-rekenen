$(document).ready(function(){
    let input = {};
    let current = 0;
    let testEnd = 0;
    let score = 0;
    let time = 0;
    const gaugeWidth = 150;
    let progressUnit = 0;
    let counter = 0;
    let TIMER;
    
    function renderQuestion() {
        let q = input.questions[current];
        $('#question').html(q.question);
        $('#A').parent().find('p').html(q.A);
        $('#B').parent().find('p').html(q.B);
        $('#C').parent().find('p').html(q.C);
        $('#D').parent().find('p').html(q.D);
        if (current == input.questions.length - 1) {
            $('#proceed').html('Evaluatie voltooien');
        }
    }
    
    function updateScore() {
        $('#score').find('p').html(score + '/' + input.questions.length);
    }
    
    function renderScore() {
        $('#scoreCard').find('h5').html('U behaalde ' + score + '/' + input.questions.length);
        $('#evaluation').slideUp();
        $('#scoreCard').slideDown();
    }
    
    function renderTimer() {
        if (counter <= time) {
            $('#timer').html(counter);
            //$('#timeGauge').style.width = progressUnit * counter + "px";
            counter++;
        }
        else {
            clearInterval(TIMER);
            renderScore();
        }
    }
    
    function startTest() {
        renderTimer();
        TIMER = setInterval(renderTimer, 1000);
        updateScore();
        renderQuestion();
        $('#instructions').slideUp();
        $('#evaluation').slideDown();
    }
    
    $('#to-test').on('click', function(e) {
        let selectedOption = $('select[name="year"] option:selected');
        console.log('selected option: ' + selectedOption.val());
        $.getJSON('/static/tests/' + selectedOption.val() + '.json', function(data) {
            input = data;
            testEnd = input.questions.length - 1;
            time = input.time;
            progressUnit = gaugeWidth/time;
            startTest();
        });
    });
    
    $('.choice').on('click', function(e) {
        let choice = $(this);
        // disable choices
        $('#evaluation input').each(function() {
            $(this).prop('disabled', true);
        });
        // answer is correct
        if (input.questions[current].correct == $(this).attr('id')) {
            choice.parent().find('p').css('color', 'green');
            score++;
            updateScore();
        }
        // answer is not correct
        else {
            choice.parent().find('p').css('color', 'red');
            $('#' + input.questions[current].correct).parent().find('p').css('color', 'green');
        }
        $('#proceed').show();
    });
    
    $('#proceed').on('click', function(e) {
        // render next question if it exists
        if (current < testEnd) {
            current++;
            renderQuestion();
        }
        // end test
        else {
            clearInterval(TIMER);
            renderScore();
        }
        $(this).hide();
    });

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
    
    $('#to-instructions').on('click', function(e) {
         $('#welcome').slideUp();
         $('#instructions').slideDown();
    });
    
    $('#back-welcome').on('click', function(e) {
         $('#welcome').slideDown();
         $('#instructions').slideUp();
    });
    
    
    
});
