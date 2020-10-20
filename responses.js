// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const line = require('@line/bot-sdk');

// create LINE SDK client
const client = new line.Client(config);

const responses = {
  noQuota(event) {
    const message = {
      type: 'text', text: '呱！請先設定本月扣打：quota 數字'
    }
    return client.replyMessage(event.replyToken, message)
  },
  setFirstQuota(event, number) {
    const message = {
      type: 'text', text: `呱！您已設定 quota 金額為 ${number}元，請繼續設定每餐上限：limit 數字。`
    }
    return client.replyMessage(event.replyToken, message)
  },
  resetQuota(event, number) {
    const message = {
      type: 'text', text: `呱！您已重新設定 quota 金額為 ${number}元`
    }
    return client.replyMessage(event.replyToken, message)
  },
  noLimit(event) {
    message = {
      type: 'text', text: '呱！請先設定本月扣打：limit 數字'
    }
    return client.replyMessage(event.replyToken, message)
  },
  setFirstLimit(event, number) {
    const message = {
      type: 'text', text: `呱！您已設定 limit 金額為 ${number}元，可以開始紀錄飲食開銷了！`
    }
    return client.replyMessage(event.replyToken, message)
  },
  resetLimit(event, number) {
    const message = {
      type: 'text', text: `呱！您已重新設定 limit 金額為 ${number}元，可以開始紀錄飲食開銷了！`
    }
    return client.replyMessage(event.replyToken, message)
  },
  toGreet(event, name) {
    const message = {
      type: 'text',
      text: `您好，${name}，呱！\n我是阿呱，你的企鵝管家，我可以替你計算這個月吃飯超支了多少。`
    }
    return client.replyMessage(event.replyToken, message)
  },
  toThank(event, name) {
    const message = {
      type: 'text',
      text: `不客氣，${name}，這是我的榮幸，呱！`
    }
    return client.replyMessage(event.replyToken, message)
  },
  toSendSticker(event) {
    const message = {
      type: 'sticker',
      packageId: "1",
      stickerId: '13'
    }
    return client.replyMessage(event.replyToken, message)
  },
  toShowLove(event, name) {
    const message = {
      type: 'text',
      text: `${name}，我愛你！呱！`
    }
    return client.replyMessage(event.replyToken, message)
  },
  invalidInput(event, name) {
    const message = {
      type: 'text',
      text: `不好意思，${name}，這不是企鵝語，呱！我看不懂。輸入的訊息必須是用空格分開，最多兩個詞的格式。另外，我不跟人聊天，我只是一隻企鵝，不是AI。`
    }
    return client.replyMessage(event.replyToken, message)
  },
  toSeeAll(event, data, quota, limit, pic) {
    const message = {
      "type": "flex",
      "altText": "expense received!",
      "contents": {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": pic,
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover",
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": '',
              "weight": "bold",
              "size": "xl"
            },
            {
              "type": "box",
              "layout": "vertical",
              "margin": "lg",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "剩餘扣打",
                      "size": "md",
                      "weight": "bold"
                    },
                    {
                      "type": "text",
                      "text": quota,
                      "wrap": true,
                      "size": "md",
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "每餐上限",
                      "size": "md",
                      "weight": "bold"
                    },
                    {
                      "type": "text",
                      "text": limit,
                      "wrap": true,
                      "size": "md",
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "品項名稱",
                      "size": "md",
                      "weight": "bold"
                    },
                    {
                      "type": "text",
                      "text": '花費金額',
                      "wrap": true,
                      "size": "md",
                      "weight": "bold"
                    }
                  ]
                },
                {
                  "type": "separator",
                  "margin": "xs"
                },
              ],
              "width": "80%",
            }
          ],
          "alignItems": "center"
        }
      }
    }

    const item = {
      "type": "box",
      "layout": "horizontal",
      "spacing": "sm",
      "contents": [
        {
          "type": "text",
          "text": "",
          "size": "md"
        },
        {
          "type": "text",
          "text": '',
          "wrap": true,
          "size": "md"
        }
      ]
    }

    let sum = 0
    for (let i = 0; i < data.length; i++) { // for (let item of data) {   待優化
      if (data[i].title !== 'quota' && data[i].title !== 'limit') {
        sum += (+ data[i].number)
        const item = {
          "type": "box",
          "layout": "horizontal",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": data[i].title,
              "size": "md"
            },
            {
              "type": "text",
              "text": data[i].number,
              "wrap": true,
              "size": "md"
            }
          ]
        }
        message.contents.body.contents[1].contents.push(item)
      }
    }
    message.contents.body.contents[0].text = `總開銷：${sum}`

    return client.replyMessage(event.replyToken, message)
  },
  insertDataOverLimit(event, title, number, overNumber, quota, limit, pic) {
    const message = {
      "type": "flex",
      "altText": "expense received!",
      "contents": {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": pic,
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover",
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": title,
              "weight": "bold",
              "size": "xl"
            },
            {
              "type": "box",
              "layout": "vertical",
              "margin": "lg",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "開銷金額",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": number,
                      "wrap": true,
                      "size": "md"
                    }
                  ]
                },
                {
                  "type": "separator",
                  "margin": "xs"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "剩餘扣打",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": quota,
                      "wrap": true,
                      "size": "md"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "每餐上限"
                    },
                    {
                      "type": "text",
                      "text": limit
                    }
                  ]
                }
              ],
              "width": "80%",
            }
          ],
          "alignItems": "center"
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": `超支${overNumber}元，從本月扣打扣除。`,
              "align": "center",
              "color": "#1d3557",
              "weight": "bold"
            }
          ],
          "flex": 0
        }
      }
    }
    return client.replyMessage(event.replyToken, message)
  },
  insertDataWithinLimit(event, title, number, quota, limit, pic) {
    const message = {
      "type": "flex",
      "altText": "expense received!",
      "contents": {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": pic,
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover",
          "action": {
            "type": "uri",
            "uri": "http://linecorp.com/"
          }
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": title,
              "weight": "bold",
              "size": "xl"
            },
            {
              "type": "box",
              "layout": "vertical",
              "margin": "lg",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "開銷金額",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": number,
                      "wrap": true,
                      "size": "md"
                    }
                  ]
                },
                {
                  "type": "separator",
                  "margin": "xs"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "text",
                      "text": "剩餘扣打",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": quota,
                      "wrap": true,
                      "size": "md"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "text",
                      "text": "每餐上限"
                    },
                    {
                      "type": "text",
                      "text": limit
                    }
                  ]
                }
              ],
              "width": "80%",
            }
          ],
          "alignItems": "center"
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": "棒！這次沒有超支！",
              "align": "center",
              "color": "#1d3557",
              "weight": "bold"
            }
          ],
          "flex": 0
        }
      }
    }
    return client.replyMessage(event.replyToken, message)
  },
  showTutorial(event, displayName) {
    const message = {
      type: 'text',
      text: '需要幫助嗎？那我說明一下使用方式：\n\n1. 設定每月超支額度：\n    輸入 quota + 空格 +數字\n2. 設定每餐開銷上限：\n    輸入 limit + 空格 + 數字\n3. 查看所有開銷紀錄\n    輸入「全部」或「all」'
    }
    return client.replyMessage(event.replyToken, message)
  },
  showImage(event, img) {
    const message = {
      "type": "image",
      "originalContentUrl": img,
      "previewImageUrl": img
    }
    return client.replyMessage(event.replyToken, message)
  },
  test(event) {
    const message = [
      {
        "type": "text",
        "text": "Hello, world1"
      },
      {
        "type": "text",
        "text": "Hello, world2"
      }
    ]
    console.log('-----------testing----------')
    console.log(message)
    return client.replyMessage(event.replyToken, message)
  }
}

module.exports = responses