from flask import Flask
from flask import render_template
from flask import session, request, json, redirect
from datetime import datetime
import re

app = Flask(__name__)
app.secret_key = "abcdefgsecretkey123420"

## API ##

@app.route("/api/login", methods=["POST"])
def api_login():
    username = request.form.get("username")

    if re.match(r'r[0-9]+', username):
        session['username'] = username
        email = request.form.get("email")
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
            return render_template('admin.html', session=session)
    return redirect('/')

@app.route('/evaluation')
def render_evaluation():
    if 'username' in session:
        if session['username'] != 'admin':
            return render_template('evaluation.html', session=session)
        else:
            return redirect('/admin')

if __name__ == '__main__':
    app.run()
