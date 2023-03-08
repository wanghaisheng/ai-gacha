import Replicate from 'replicate-js'

interface ICardModel {
  generate(): AsyncIterable<any>
}

const DEFAULT_PROMPT = 'mksks style, masterpiece, best quality, ultra-detailed, illustration, close-up, straight on, face focus, 1girl, white hair, golden eyes, long hair, halo, angel wings, serene expression, looking at viewer'
const DEFAULT_NEGATIVE_PROMPT = 'lowres, ((bad anatomy)), ((bad hands)), text, missing finger, extra digits, fewer digits, blurry, ((mutated hands and fingers)), (poorly drawn face), ((mutation)), ((deformed face)), (ugly), ((bad proportions)), ((extra limbs)), extra face, (double head), (extra head), ((extra feet)), monster, logo, cropped, worst quality, low quality, normal quality, jpeg, humpbacked, long body, long neck, ((jpeg artifacts))'
const DEFAULT_WIDTH = 448
const DEFAULT_HEIGHT = 640

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default class Model implements ICardModel {
  static readonly PendingState = ["starting", "processing"]

  public readonly version: string
  public readonly client: Replicate

  constructor(client: Replicate, version: string) {
    this.client = client
    this.version = version
  }

  async *generate(): AsyncGenerator<any, void, unknown> {
    const input = {
      prompt: DEFAULT_PROMPT,
      neg_prompt: DEFAULT_NEGATIVE_PROMPT,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    };


    const predict = await this.client.startPrediction(this.version, input)
    while(true) {
      const nextPredict = await this.client.getPrediction(predict.id)
      await sleep(this.client.pollingInterval || 1000)

      const res = nextPredict.output?.pop() || null
      if (Model.PendingState.includes(nextPredict.status)) {
        yield res
      } else {
        return res
      }
    }
  }
}
