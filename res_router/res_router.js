const line = require('@line/bot-sdk');
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);
const query = require('../mysql.js');
const responses = require('.././responses.js');
const Axios = require('axios');


const eventInit = (event) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // identify user
  console.log('---------------- event ----------------')
  console.log(event)

  // event data
  const eventData = {
    event: event,
    clientInfo: {},
    clientInput: {
      inputTitle: event.message.text.split(' ')[0],
      inputNumber: event.message.text.split(' ')[1]
    },
    clientSetting: {
      userQuota: 0,
      userLimit: 0
    }
  }

  const userId = eventData.event.source.userId

  client.getProfile(userId)
    .then((profile) => {
      console.log('-------------- user Info --------------')
      eventData.clientInfo = JSON.parse(JSON.stringify(profile))
      console.log(eventData.clientInfo)
    })
    .then(() => {
      // create table if not exists | SELECT quota & limit
      query.createTable(userId, () => quotaCheck(eventData))
    })
    .catch((err) => console.error(err))
}


// quota check
const quotaCheck = (eventData) => {
  const event = eventData.event
  const userId = eventData.event.source.userId
  const inputTitle = eventData.clientInput.inputTitle
  const inputNumber = eventData.clientInput.inputNumber

  // quota setting check
  query.selectOne(userId, 'quota', (quota) => {
    // no quota yet and user has no intend to set it
    if (!quota.length && inputTitle !== 'quota') {
      return responses.noQuota(event)
      // no quota yet and user tries to set it
    } else if (!quota.length && inputTitle === 'quota') {
      query.insertData(userId, 'quota', inputNumber, () => {
        return responses.setFirstQuota(event, inputNumber)
      })
      // user tries to reset quota
    } else if (quota.length && inputTitle === 'quota') {
      query.updateOne(userId, 'quota', inputNumber, () => {
        return responses.resetQuota(event, inputNumber)
      })

    } else {
      eventData.clientSetting.userQuota = quota[0].number
      limitCheck(eventData)
    }
  })
}


// limit check
const limitCheck = (eventData) => {
  const event = eventData.event
  const userId = eventData.event.source.userId
  const inputTitle = eventData.clientInput.inputTitle
  const inputNumber = eventData.clientInput.inputNumber

  query.selectOne(userId, 'limit', (limit) => {
    // no limit yet and user has no intend to set it
    if (!limit.length && inputTitle !== 'limit') {
      return responses.noLimit(event)
      // no limit yet and user tries to set it
    } else if (!limit.length && inputTitle === 'limit') {
      query.insertData(userId, 'limit', inputNumber, () => {
        return responses.setFirstLimit(event, inputNumber)
      })
      // user tries to reset limit
    } else if (limit.length && inputTitle === 'limit') {
      query.updateOne(userId, 'limit', inputNumber, () => {
        return responses.resetLimit(event, inputNumber)
      })
    } else {
      eventData.clientSetting.userLimit = limit[0].number
      res(eventData)
    }
  })
}

// responses
const res = (eventData) => {
  const event = eventData.event
  const userId = eventData.event.source.userId
  const displayName = eventData.clientInfo.displayName
  const input = eventData.event.message.text
  const inputTitle = eventData.clientInput.inputTitle
  const inputNumber = eventData.clientInput.inputNumber
  let userQuota = eventData.clientSetting.userQuota
  const userLimit = eventData.clientSetting.userLimit

  if (input.includes('嗨')
    || input.includes('hi')
    || input.includes('哈囉')
    || input.includes('早')
    || input.includes('你好')
    || input.includes('您好')
    || input.includes('妳好')) {
    return responses.toGreet(event, displayName)

  } else if (input.includes('test')) {
    return responses.test(event)

    // to thank
  } else if (input.includes('謝')
    || input.includes('很好')
    || input.includes('good')
    || input.includes('讚')
    || input === '棒'
    || input.includes('thank')) {
    return responses.toThank(event, displayName)

    // to send sticker
  } else if (input.includes('貼圖')) {
    return responses.toSendSticker(event)

    // to see all
  } else if (input.includes('all') || input.includes('全部')) {
    Axios.get('https://api.thecatapi.com/v1/images/search')
      .then(res => {
        const pic = res.data[0].url
        query.selectAll(userId, (data) => {
          return responses.toSeeAll(event, data, userQuota, userLimit, pic)
        })
      })
      .catch(err => console.error(err))

  } else if (input.includes('教學')) {
    return responses.showTutorial(event, displayName)

  } else if (input.includes('吸貓')) {
    Axios.get('https://api.thecatapi.com/v1/images/search')
      .then(res => {
        const img = res.data[0].url
        return responses.showImage(event, img)
      })

    // to insert one data
  } else {
    if (input.split(' ').length !== 2) {
      return responses.invalidInput(event, displayName)
    } else {
      query.insertData(userId, inputTitle, inputNumber, () => {
        const overNumber = inputNumber - userLimit

        Axios.get('https://api.thecatapi.com/v1/images/search')
          .then(res => {
            const pic = res.data[0].url

            if (overNumber > 0) {
              let newNumberOfQuota = userQuota - overNumber
              query.updateOne(userId, 'quota', newNumberOfQuota, () => {
                query.selectOne(userId, 'quota', (result) => {
                  userQuota = result[0].number
                  return responses.insertDataOverLimit(event, inputTitle, inputNumber, overNumber, userQuota, userLimit, pic)
                })
              })
            } else {
              return responses.insertDataWithinLimit(event, inputTitle, inputNumber, userQuota, userLimit, pic)
            }
          })
          .catch(err => console.error(err))
      })
    }
  }
}

module.exports = eventInit