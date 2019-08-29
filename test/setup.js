process.env.NODE_ENV = 'test'
process.env.API_TOKEN = 'test-auth-token'
process.env.TZ = 'UTC'

require('dotenv').config()
const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest


// const { expect } = require('chai');
// const supertest = require('supertest');

// global.expect = expect;
// global.supertest = supertest;