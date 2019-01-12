# General
import os
# Flask
from flask import Flask, render_template, flash, request, url_for, jsonify
# Celery
from celery import Celery
# API
import api

# Configure app
app = Flask(__name__)
app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)

# Configure Celery
celery = Celery(
    app.name,
    broker=app.config['CELERY_BROKER_URL']
)
celery.conf.update(app.config)

@celery.task
def APICall(data={}):
    """ Asynchronous call to ChompChap API """
    result = api.Call(data)

    return { "result": result }

@app.route("/", methods=['GET', 'POST'])
def Index():
    """ Main page """
    return render_template("index.html")

@app.route("/query", methods=['POST'])
def Query():
    """ Handle requests """
    data = request.data
    print(data)
    task = APICall.apply_async(args=[data])
    return jsonify({}), 202, {'Location': url_for('Status', taskID=task.id)}

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT",3000))
    app.run(host="0.0.0.0", port=port)
