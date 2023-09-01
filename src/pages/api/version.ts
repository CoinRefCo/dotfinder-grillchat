import { NextApiRequest, NextApiResponse } from 'next'

const VERSION = '7'

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(VERSION)
}
