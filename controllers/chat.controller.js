import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '../utils/makechain.js';
import { pinecone } from '../utils/pinecone-client.js';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '../config/pinecone.js';
import { LocalStorage } from 'node-localstorage';
export default async function handler(req, res) {

  global.localStorage = new LocalStorage('./data') 

  const { question, history, VisiterId } = req.body;

  const getApiCalls = (userId) => {
    const apiCallsStr = localStorage.getItem(`apiCalls:${userId}`);
    if (!apiCallsStr) {
      return [];
    }
  
    const apiCalls = JSON.parse(apiCallsStr);
    const now = Date.now();
    const hour = 60 * 60 * 1000; // 1 hour in milliseconds
    if (now - apiCalls.timestamp > hour) {
      localStorage.removeItem(`apiCalls:${userId}`);
      return [];
    }
  
    return apiCalls.data;
  };
  
  const addApiCall = (userId, apiCall) => {
    const apiCalls = getApiCalls(userId);
    const now = Date.now();
    apiCalls.push(apiCall);
    localStorage.setItem(`apiCalls:${userId}`, JSON.stringify({ data: apiCalls, timestamp: now }));
  };
  


  const allapicalls = getApiCalls(VisiterId)
  console.log(allapicalls)

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
    });

    const chain = makeChain(vectorStore);
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: allapicalls || [],
    });
    // console.log('response', response);
    res.status(200).json(response);
    addApiCall(VisiterId, question)
  }
  catch (error) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
