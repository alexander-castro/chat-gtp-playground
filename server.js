require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: "org-58ejHIjPolTGWnu0ebT8jfp1",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.set('view engine', 'pug')
app.set('views', './views');

app.get('/', function(req, res){
  res.render('form');
});

app.post('/', async (req, res) => {
  skillsPrompt = `Extract a list of granullar skills for this job offert each skill can only have max ten words and separated with a comma:\n\n ${req.body.job}`
  skillResponseText = await sendChatGTPRequest(skillsPrompt)
  skills = skillResponseText.substring(0, skillResponseText.length - 1).split(",")

  otherSkillsPrompt = `Give me a list of granullar skills for this job offert each skill can only have max ten words and separated with a comma not mentioned in the text:\n\n ${req.body.job}`,
  othersSkillResponseText = await sendChatGTPRequest(otherSkillsPrompt)
  otherSkills = othersSkillResponseText.substring(0, othersSkillResponseText.length - 1).split(",")

  res.render('report', { job: req.body.job, skills: skills, otherSkills: otherSkills})
})

async function sendChatGTPRequest(prompt) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.8,
    presence_penalty: 0.0,
  });
  return response.data.choices[0].text
};

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})