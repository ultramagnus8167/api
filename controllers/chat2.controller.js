import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '../utils/makechain.js';
import { pinecone } from '../utils/pinecone-client.js';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '../config/pinecone.js';
import connectMongoDb from '../utils/mongo-client.js';

export default async function handler(req, res) {


  const { question, VisitorId } = req.body

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  var historymongo = [];

  const DB = await connectMongoDb()

  const collection = DB.collection('questionHistory');

  const doc = await collection.findOne({ _id: `${VisitorId}` });
  if (doc) {
    const filter = { _id: `${VisitorId}` };
    const update = { $push: { history: question } };
    const options = { returnOriginal: false };
    const result = await collection.findOneAndUpdate(filter, update, options);
    historymongo = doc.history
  }
  else {
    collection.insertOne({ _id: `${VisitorId}`, history: [question] });
  }


  console.log(historymongo)

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
      chat_history: historymongo || [],  // Add history here
    });
    // console.log('response', response);
    res.status(200).json(response);
  }
  catch (error) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}

