from flask import render_template

from . import home

@home.route("/")
def index():
	return render_template("index.html")

@home.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@home.route("/booking")
def booking():
	return render_template("booking.html")

@home.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")
