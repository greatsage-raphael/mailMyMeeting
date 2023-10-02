// summarize.js

import OpenAI from 'openai';
const OPENAI_API_KEY = "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"

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // Make sure to set this in your environment variables
    dangerouslyAllowBrowser: true, 
  });
  
  async function summarizeMeeting(transcription) {
      // Abstract Summary
      const abstractSummaryResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
              {
                  role: "system",
                  content: "You are a highly skilled AI trained in language comprehension and summarization. Summarize the following text into a concise abstract paragraph."
              },
              {
                  role: "user",
                  content: transcription
              }
          ]
      });
  
      // Key Points
      const keyPointsResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
              {
                  role: "system",
                  content: "Identify and list the main points discussed in the text."
              },
              {
                  role: "user",
                  content: transcription
              }
          ]
      });
  
      // Action Items
      const actionItemsResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
              {
                  role: "system",
                  content: "Identify any tasks, assignments, or actions mentioned in the text."
              },
              {
                  role: "user",
                  content: transcription
              }
          ]
      });
  
      // Sentiment Analysis
      const sentimentResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
              {
                  role: "system",
                  content: "Analyze the sentiment of the following text."
              },
              {
                  role: "user",
                  content: transcription
              }
          ]
      });
  
      // Extracting the actual responses for string interpolation
      const abstractSummary = abstractSummaryResponse.choices[0].message.content;
      const keyPoints = keyPointsResponse.choices[0].message.content.split('-').join('\n- ');
      const actionItems = actionItemsResponse.choices[0].message.content.split('.').join('.\n');
      const sentimentAnalysis = sentimentResponse.choices[0].message.content;
  
      // Combining all summaries using string interpolation with improved formatting
      return `
  1. 📝ABSTRACT SUMMARY:
  ${abstractSummary   }
  
  2. 🔑 KEY POINTS:
  ${keyPoints   }
  
  3. 🎬 ACTION ITEMS:
  ${actionItems   }
  
  4. 🤔 SENTIMENT ANALYSIS:
  ${sentimentAnalysis  }
      `;
  }
  
  export default summarizeMeeting;