/* eslint-disable @typescript-eslint/no-var-requires */
require('chai-snapshot-matcher')

const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiQuantifiers = require('chai-quantifiers')
const deepEqualInAnyOrder = require('deep-equal-in-any-order')

chai.use(sinonChai)
chai.use(chaiQuantifiers)
import('chai-as-promised').then((chaiAsPromised) => chai.use(chaiAsPromised.default))
chai.use(deepEqualInAnyOrder)
