$(document).ready(function(){
    const gaugeWidth = 150;
    let progressUnit = 0;
    renderQuestion();
    
    function renderQuestion() {
        let q = {}
        $.ajax({
            url: '/api/render_question',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    updateProgress();
                    let q = response.Question;
                    console.log(response.Question);
                    $('#A').parent().find('p').html(q.A);
                    $('#B').parent().find('p').html(q.B);
                    $('#C').parent().find('p').html(q.C);
                    $('#D').parent().find('p').html(q.D);
                    if (response.LastQuestion === "True") {
                        $('#proceed').html('Evaluatie voltooien');
                    }
                    $('#question').html(q.question);
                }
                else if (response.Status === "Done") {
                    renderScore();
                }
                else if (response.Status === "Error") {
                    console.log("Error");
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
    
    function updateProgress() {
        $.ajax({
            url: '/api/get_progress',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    $('#score').find('p').html(response.Progress);
                }
                else if (response.Status === "Error") {
                    console.log("Error");
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
    
    function renderScore() {
        $.ajax({
            url: '/api/get_score',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    $('#scoreCard').find('h5').html('U behaalde ' + response.Value);
                }
                else if (response.Status === "Error") {
                    console.log("Error");
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
        $('#evaluation').slideUp();
        $('#scoreCard').slideDown();
    }
    
    function startTest() {
        updateProgress();
        renderQuestion();
        $('#instructions').slideUp();
        $('#evaluation').slideDown();
    }
    
    $('#to-test').on('click', function(e) {
        let selectedOption = $('select[name="year"] option:selected');
        console.log('selected option: ' + selectedOption.val());
        $.ajax({
            url: '/api/start_test',
            data: {
                "year": selectedOption.val()
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Success") {
                    startTest();
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
    
    $('.choice').on('click', function(e) {
        let choice = $(this);
        // disable choices
        $('#evaluation input').each(function() {
            $(this).prop('disabled', true);
        });
        
        $.ajax({
            url: '/api/make_choice',
            data: {
                "choice": $(this).attr('id'),
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "Correct") {
                    choice.parent().find('p').css('color', 'green');
                }
                else if (response.Status === "Incorrect") {
                    choice.parent().find('p').css('color', 'red');
                    $('#' + response.Correct).parent().find('p').css('color', 'green');
                    $('#correction').html(response.Correction);
                }
                else {
                    window.location.href = "/evaluation";
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
        $('#proceed').show();
    });
    
    $('#proceed').on('click', function(e) {
        // render next question if it exists
        updateProgress();
        renderQuestion();
        $(this).hide();
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
