/* eslint-disable @typescript-eslint/no-var-requires */
require('@babel/register')({
  configFile: './babel.config.json',
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
})

require('chai-snapshot-matcher')

const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiQuantifiers = require('chai-quantifiers')
const chaiAsPromised = require('chai-as-promised')
const deepEqualInAnyOrder = require('deep-equal-in-any-order')

chai.use(sinonChai)
chai.use(chaiQuantifiers)
chai.use(chaiAsPromised)
chai.use(deepEqualInAnyOrder)
