from flask import Flask
from flask import render_template
from flask import session, request, json, redirect
import psycopg2
from datetime import datetime
import re
import json
import os

DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')
conn.set_session(readonly=False, autocommit=True)

app = Flask(__name__)
app.secret_key = "abcdefgsecretkey123420"

## API ##

@app.route("/api/login", methods=["POST"])
def api_login():
    username = request.form.get("username")

    if re.match(r'r[0-9]+', username):
        session['username'] = username
        email = request.form.get("email")
        session['email'] = email
        print("username: ", username, " , email: ", email)
        return json.dumps({"Status": "Success"})
    if username == 'admin':
        password = request.form.get("password")
        print("username: ", username, " , password: ", password)
        if password == 'supersafe':
            session['username'] = username
            return json.dumps({"Status": "Success"})
        else:
            return json.dumps({"Status": "ErrorPass"})
    else:
        return json.dumps({"Status": "ErrorUser"})

@app.route('/api/make_choice', methods=["POST"])
def api_make_choice():
    if 'year' not in session:
        return json.dumps({"Status": "Error"})

    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, 'static/tests/' + session['year'] + '.json')
    choice = request.form.get("choice")
    current = session['current']

    input = {}
    with open(file_path) as json_file:
        input = json.load(json_file)

    if choice == input['questions'][current]['correct']:
        session['current'] += 1
        if 'score' in session:
            session['score'] += 1
        else:
            session['score'] = 1
        return json.dumps({"Status": "Correct"})
    else:
        session['current'] += 1
        if 'score' not in session:
            session['score'] = 0
        return json.dumps({"Status": "Incorrect", "Correction": input['questions'][current]['correction'], "Correct": input['questions'][current]['correct']})

def results_exist():
    exists_query = '''
        SELECT exists (
            SELECT 1
            FROM Resultaten
            WHERE username = %s and year = %s
        )'''
    cur = conn.cursor()
    cur.execute(exists_query, (session['username'], session['year'],))
    return cur.fetchone()[0]

# Receive score and put it in DataBase (if it does not yet exist)
@app.route('/api/get_score')
def api_get_score():
    if 'score' in session:
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, 'static/tests/' + session['year'] + '.json')
        choice = request.form.get("choice")
        current = session['current']

        input = {}
        with open(file_path) as json_file:
            input = json.load(json_file)
        score = session['score']

        if not results_exist():
            query = """INSERT INTO resultaten (username, email, year, score) VALUES (%s, %s, %s, %s)"""
            conn.cursor().execute(query, (session['username'], session['email'], session['year'], str(score) + "/" + str(len(input['questions']))))

        session.clear()
        return json.dumps({"Status": "Success", "Value": str(score) + "/" + str(len(input['questions']))})
    else:
        session.clear()
        return json.dumps({"Status": "Error"})

@app.route('/api/check_exists', methods=["POST"])
def api_check_exists():
    exists_query = '''
            SELECT exists (
                SELECT 1
                FROM Resultaten
                WHERE username = %s and year = %s
            )'''
    cur = conn.cursor()
    cur.execute(exists_query, (session['username'], request.form.get("year"),))
    return cur.fetchone()[0]

@app.route('/api/start_test', methods=["POST"])
def api_start_test():
    session['year'] = request.form.get("year")
    session['score'] = 0
    session['current'] = 0
    return json.dumps({"Status": "Success"})

@app.route('/api/render_question')
def api_render_question():
    if 'year' in session and 'current' in session:
        current = session['current']
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, 'static/tests/' + session['year'] + '.json')
        input = {}
        with open(file_path) as json_file:
            input = json.load(json_file)

        if current == len(input['questions']):
            return json.dumps({"Status": "Done"})

        lq = "False"
        if current == len(input['questions']) - 1:
            lq = "True"
        return json.dumps({"Status": "Success", "Question": input['questions'][current], "LastQuestion": lq})

    else:
        return json.dumps({"Status": "Error"})

@app.route('/api/get_progress')
def api_get_progress():
    if 'current' in session:
        if 'year' in session:
            script_dir = os.path.dirname(__file__)
            file_path = os.path.join(script_dir, 'static/tests/' + session['year'] + '.json')
            current = session['current']
            input = {}
            with open(file_path) as json_file:
                input = json.load(json_file)
        return json.dumps({"Status": "Success", "Progress": str(session['current']+1) + "/" + str(len(input['questions']))})

    else:
        return json.dumps({"Status": "Error"})

@app.route('/logout')
def api_logout():
    session.pop('username')
    return redirect('/')


## Routes ##

@app.route('/')
def render_home():
    return render_template('index.html', session=session)

@app.route('/admin')
def render_admin():
    if 'username' in session:
        if session['username'] == 'admin':
            cur = conn.cursor()
            query = "SELECT * FROM resultaten " \
                    "ORDER BY username"
            cur.execute(query, ())
            answer = cur.fetchall()
            response = []
            for i in range(len(answer)):
                response.append(dict())
                response[i]['username'] = answer[i][0]
                response[i]['email'] = answer[i][1]
                response[i]['year'] = answer[i][2]
                response[i]['score'] = answer[i][3]

            return render_template('admin.html', session=session, results=response)
    return redirect('/')

@app.route('/evaluation')
def render_evaluation():

    if 'username' in session:
        if session['username'] != 'admin':
            if 'current' in session:
                current = session['current']
                script_dir = os.path.dirname(__file__)
                file_path = os.path.join(script_dir, 'static/tests/' + session['year'] + '.json')
                input = {}
                with open(file_path) as json_file:
                    input = json.load(json_file)

                if current == len(input['questions']):
                    return render_template('evaluation.html', session=session, current=session['current'], score=True)

                return render_template('evaluation.html', session=session, current=session['current'])
            else:
                return render_template('evaluation.html', session=session)
        else:
            return redirect('/admin')
    else:
        return redirect('/')


if __name__ == '__main__':
    app.run()
