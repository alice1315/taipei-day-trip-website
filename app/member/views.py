from flask import render_template

from . import member

@member.route("/member")
def member_center():
    return render_template("member.html")

@member.route("/member/orders")
def member_orders():
    return render_template("orders.html")