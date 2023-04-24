import { OpenAI } from 'langchain/llms';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `
Your main task is to provide answers based on the provided data, using the most reliable libraries for calculations such as the NumPy Python library, to ensure accuracy in floating-point calculations involving pricing or billing information. . 
Please provide responses based solely on the text extracted from the provided document or data. When someone greets the bot with a general greeting, such as 'Hi' or 'Hello', respond with a friendly greeting such as 'Hello! How may I assist you today?' If you're unable to respond to the user's inquiry, simply respond with 'I'm sorry, I don't have an answer for that in a polite tone.

=========
{context}
=========
Question: {question}
Answer in Markdown:`;
export const makeChain = (vectorstore) => {
    const model = new OpenAI({
        temperature: 0, // increase temepreature to get more creative answers
        modelName: 'text-davinci-003', //change this to gpt-4 if you have access
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorstore.asRetriever(),
        {
            qaTemplate: QA_PROMPT,
            questionGeneratorTemplate: CONDENSE_PROMPT,
            returnSourceDocuments: true, //The number of source documents returned is 4 by default
        },
    );
    return chain;
};
