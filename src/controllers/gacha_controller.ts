import { Controller } from "@hotwired/stimulus"
import Replicate from 'replicate-js'

import { getState } from '../state'
import { PredictService } from '../services'
import { PredictState } from '../entities'

export default class extends Controller {
  static targets = ["subscriber"]

  private predictor?: PredictService

  declare readonly hasSubscriberTarget: boolean
  declare readonly subscriberTargets: Element[]

  setupClient() {
    const state = getState()
    if(!state.hasToken) {
      return
    }

    const replicate = new Replicate({ token: state.token })
    replicate.baseUrl = `${window.location.origin}/ai`

    this.predictor = new PredictService(replicate, import.meta.env.VITE_MODEL_VERSION)
  }

  async draw() {
    if(!this.predictor) {
      return
    }

    this.subscriberTargets.forEach(target => {
      this.dispatch("start", { target })
    })

    const state = getState()
    let prediction: PredictState = new PredictState()
    for await (prediction of this.predictor.predict(state.currentCard)) {
    }

    if (!prediction.hasOutput) {
      this.subscriberTargets.forEach(target => {
        this.dispatch("failed", { target })
      })
      return
    }

    this.subscriberTargets.forEach(target => {
      this.dispatch("success", { target, detail: { url: prediction.outputURL }})
    })
  }

  download() {
    this.subscriberTargets.forEach(target => {
      this.dispatch("download", { target })
    })
  }
}
