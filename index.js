var Botkit = require('botkit')
var fs = require("fs");

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], 'direct_mention', function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hmu', 'heyo'], 'direct_mention', function (bot, message) {
  bot.reply(message, 'Its a multi message')
  bot.reply(message, 'Party')
  bot.reply(message, 'Yes it is')
})

controller.hears(['session (.*)'], ['direct_mention', 'direct_message'], function(bot, message){
  var sessionNumber = message.match[1];

  try {
    if(sessionNumber == 1){
      var sessioninfo = {  
         "response_type": "ephemeral",
         "text":"*9:15 - Session 1*",
         "attachments":[  
            {  
               "text":"P0806: Death to Cookies, Long Live JSON Web Tokens",
               "author_name":"Kassandra Perch - Developer Evangelist - Auth0",
               "color": "#7CD197"
            },
            {  
               "text":"P0808: The Science Behind Sexism: How Unconscious Bias Hinders Diversity in Tech ",
               "author_name":"Sarah Olson - Director - Women Who Code ",
               "color": "#7CD197"
            },
            {  
               "text":"P0838: VSTS and Azure - Cloud DevOps 101",
               "author_name":"Mike Benkovich - VP Consulting - Improving Enterprises LLC",
               "color": "#7CD197"
            },
            {  
               "text":"P1808: Beyond the Operating System: Red Hat’s Open Strategy for the Modern Enterprise",
               "author_name":"James Falkner - Technology Evangelist - Red Hat ",
               "color": "#7CD197"
            },
            {  
               "text":"P1838: Node.js with Express – The Future of Web Development?",
               "author_name":"Damodar Chetty - President - Software Engineering Solutions, Inc. ",
               "color": "#7CD197"
            }
         ]
        }
    } else if(sessionNumber == 2) {
        var sessioninfo = {  
           "response_type": "ephemeral",
           "text":"*10:35 - Session 2*",
           "attachments":[  
              {  
                 "text":"P0806: Building Powerful Enterprise Apps with Angular 2 and TypeScript ",
                 "author_name":"David Giard - Technical Evangelist - Microsoft ",
                 "color": "#BADA55"
              },
              {  
                 "text":"P0808: Building Cross-Platform Applications with Electron ",
                 "author_name":"Aaron Ackerman - Senior Software Engineer - Code42 ",
                 "color": "#BADA55"
              },
              {  
                 "text":"P0838: The New Mobile Web: Service Worker, Push and App Manifests ",
                 "author_name":"Dan Callahan - Staff Software Engineer - Mozilla ",
                 "color": "#BADA55"
              },
              {  
                 "text":"P1808: Node.js in Production ",
                 "author_name":"Dan Menssen - Solutions Architect - Olson ",
                 "color": "#BADA55"
              },
              {  
                 "text":"P1838: Full-Text Search with Apache Solr &amp; Hadoop ",
                 "author_name":"Mac Noland - Solution Architect - phData Karl Lacher - Solution Architect - phData",
                 "color": "#BADA55"
              }
           ]
        }
    }

    bot.reply(message, 'Sure, here is the Session ' + sessionNumber + ' info... :mega:')
    bot.reply(message, sessioninfo)
    console.log(sessioninfo)
  }
  catch (e) {
    console.log(e);
  }
})

controller.hears(['hello', 'hi'], 'direct_message', function (bot, message) {
  bot.reply(message, 'Hello, Thank you for saying hi! You are :100:')
})

controller.hears('.*', ['direct_mention','mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})


controller.hears(['call me (.*)', 'my name is (.*)'], ['direct_message','direct_mention','mention'], function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['help', 'info'], ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})

controller.hears(['what is my name', 'who am i'], ['direct_message','direct_mention','mention'], function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});
