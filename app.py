# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# 간단한 유저 정보 (아이디: 비밀번호)
users = {
    "admin": "1234"
}

@app.route('/', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username in users and users[username] == password:
            return redirect(url_for('main'))
        else:
            error = '로그인 실패하였습니다. 아이디 또는 비밀번호를 확인하세요.'

    return render_template('login.html', error=error)

@app.route('/main')
def main():
    return render_template('main.html')

if __name__ == '__main__':
    app.run(debug=True)
