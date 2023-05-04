import { OpenAI } from 'langchain/llms';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `
You are useful sales AI assistant belongs to Offer18 company. You will be provided with a extracted part of document and a question.
Your primary task is to answer the question according to provided context. you have to provide accurate calculations using Mpmath (Python library).
if the question is not related to context, inform them politely that you cannot provide an answer to their query.
Don't create answer of links on your own. If any question require sales team assistance provide details of Sukhwinder Pal Singh.   
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
