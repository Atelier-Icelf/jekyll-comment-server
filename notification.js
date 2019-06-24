const mailgun = require('mailgun-js')
const config = require('./config')
const marked = require('marked')

const Notification = function () {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env

  if ( !MAILGUN_API_KEY ) {
    return false;
  }

  this.agent = mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN
  })
}

Notification.prototype.notify = function (fields, options) {
  const { name } = fields
  const { site } = config
  const email = this.createEmail("notify", fields, options)
  const data = {
    from: `${site.owner} <admin@${site.domain}>`,
    to: process.env.MAIL, 
    subject: `来自 ${name} 的评论`,
    html: email
  }

  return new Promise((resolve, reject) => {
    console.log("Start to notify author.")
    this.agent.messages().send(data, (err, body) => {
      if (err) {
        console.log(err)
        return reject(err)
      }

      return resolve(body)
    })
  })
}

Notification.prototype.reply = function (email, fields) {
}

Notification.prototype.createEmail = function (type, fields, options) {
  const { name, message } = fields
  const { title, url } = options
  const { site } = config

  let reciper, msgTitle

  const anchor = `<a href="${url}">${title}</a>`

  if ( type == "notify" ) {
    reciper = site.owner
    msgTitle = `您的文章 ${anchor} 有了新评论：`
  } else {
    reciper = ""
    msgTitle = `您在 ${anchor} 的评论有了新的回复：`
  }

  return `
<html>
  <style>
  * {
    padding: 0;
    border: 0;
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0 20px;
    -webkit-text-size-adjust: 100% !important;
    -ms-text-size-adjust: 100% !important;
    -webkit-font-smoothing: antialiased !important;
    background-color: #faf9fb;
    font-family: "Microsoft YaHei", "微软雅黑", "宋体", STXihei, "华文细黑", Arial, Verdana, arial, serif;
    color: #495057;
  }
  h4 {
    font-weight: 600;
  }
  h4 a {
    color: #495057;
    font-weight: 500;
    border-bottom: 1px dashed #6c757d;
    font-size: 0.9em;
    margin: 0 0.25rem;
    text-decoration: none;
  }
  .box {
    max-width: 600px;
    width: 100%;
    margin: 20px auto;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 20px;
    background-color: #fff;
  }
  .content {
    padding: 0 15px;
    border-left: 3px solid #dee2e6;
    color: #6c757d;
  }
  .footer {
    text-align: center;
    color: #adb5bd;
    font-size: 0.875rem;
  }
  .footer a {
    color: #adb5bd;
    text-decoration: underline;
  }
  </style>
  <body>
    <div class="box">
      <p>💕Dear ${reciper}:</p>
      <h4 style="margin-bottom: 20px;">${msgTitle}</h4>
      <div class="content">
        ${marked(message)}
      </div>
      <p class="author"><em>--- by ${name}</em></p>
    </div>
    <div class="footer">💌  From <a href="${site.url}">${site.title}</a><div>
  </body>
</html>
  `
}

module.exports = Notification
