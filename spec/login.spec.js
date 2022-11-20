import supertest from "supertest"
import app from "../app.js"
import mongoose from 'mongoose'
import { cleanUpDatabase, generateValidJwt } from './utils.js'
import { User } from '../model/User.js'
import bcrypt from "bcrypt";

//Clean database before
beforeEach(cleanUpDatabase)

////////////////////////////////////////////LOGIN
describe('POST /login', function () {
    //Create 2 users to begin the tests
    let jackReach
    let pierreJame
    beforeEach(async function () {
        //Hash the passwords
        const plainPassword = '1234';
        const costFactor = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, costFactor);
        [jackReach, pierreJame] = await Promise.all([
            User.create({ admin: false, firstName: 'Jack', lastName: 'Reach', userName: "jackreach", password: hashedPassword, creationDate: '2022-11-17T18:31:44.268+00:00' }),
            User.create({ admin: true, firstName: 'Pierre', lastName: 'Jame', userName: "pierrejame", password: hashedPassword, creationDate: '2022-11-18T18:31:44.268+00:00' })
        ]);

    })

    //Connect to own account
    it("user should connect to hiw own account", async function () {
        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'jackreach',
                password: '1234'
            })
            .expect(200)
            .expect('Content-Type', /json/);
            //Assertions
            expect(res.body).toBeObject()
            expect(res.body.token).toBeString()
    })

    //Try to connect to account with bad password
    it("user should not connect with a bad password", async function () {
        const res = await supertest(app)
            .post('/login')
            .send({
                userName: 'jackreach',
                password: '5678'
            })
            .expect(401)
            .expect('Content-Type', "text/plain; charset=utf-8");
    })
})

//Disconnect database afterwards
afterAll(async () => {
    await mongoose.disconnect();
});