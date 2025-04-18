import * as chai from 'chai'
import sinonChai from 'sinon-chai'
import deepEqualInAnyOrder from 'deep-equal-in-any-order'
import chaiAsPromised from 'chai-as-promised'
import 'anylogger-debug'

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(deepEqualInAnyOrder)
