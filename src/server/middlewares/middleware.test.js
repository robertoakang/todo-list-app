const request = require('supertest')
const app = require('../app')

const makeAuthenticationServiceStub = () => {
  class AuthenticationService {
    verifyUserByJWT (token) {
      return true
    }
  }

  return new AuthenticationService()
}

describe('Middlewares', () => {
  test('Should parse body as json', async () => {
    app.post('/test_body_parser', (req, res) => {
      res.send(req.body)
    })

    await request(app)
      .post('/test_body_parser')
      .send({ name: 'Roberto' })
      .expect({ name: 'Roberto' })
  })

  test('Should enable CORS', async () => {
    app.get('/test_cors', (req, res) => {
      res.send()
    })

    await request(app)
      .get('/test_cors')
      .expect('access-control-allow-origin', '*')
  })

  test('Should return default content type as json', async () => {
    app.get('/test_content_type', (req, res) => {
      res.send('')
    })

    await request(app)
      .get('/test_content_type')
      .expect('content-type', /json/)
  })

  test('Should return xml content type when forced', async () => {
    app.get('/test_content_type_xml', (req, res) => {
      res.type('xml')
      res.send('')
    })

    await request(app)
      .get('/test_content_type_xml')
      .expect('content-type', /xml/)
  })

  test('Should return 500 if auth middleware throws', async () => {
    const authenticationServiceStub = makeAuthenticationServiceStub()
    jest.spyOn(authenticationServiceStub, 'verifyUserByJWT').mockImplementationOnce(() => {
      throw new Error()
    })
    const verifyJwtFake = () => {
      return authenticationServiceStub.verifyUserByJWT('any_token')
    }
    app.get('/any_route', verifyJwtFake, (req, res) => {
      res.send('')
    })

    await request(app).get('/any_route').expect(500)
  })
})
