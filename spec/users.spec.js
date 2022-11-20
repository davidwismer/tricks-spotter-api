import supertest from "supertest"
import app from "../app.js"
import mongoose from 'mongoose'
import { cleanUpDatabase, generateValidJwt } from './utils.js'
import { User } from '../model/User.js'
import { Spot } from '../model/Spot.js'
import { Trick } from '../model/Trick.js'

//Clean database before
beforeEach(cleanUpDatabase)

//////////////////////////////////////////POST
describe('POST /users', function () {
    //Create a user with correct informations
    it('should create a user with correct informations', async function () {
        const res = await supertest(app)
            .post('/users')
            .send({
                admin: false,
                firstName: 'John',
                lastName: 'Doe',
                userName: 'johndoe',
                password: '1234'
            })
            .expect(201)
            .expect('Content-Type', /json/);
        // Check that the response body is a JSON object with exactly the properties we expect.
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(false);
        expect(res.body.firstName).toEqual('John');
        expect(res.body.lastName).toEqual('Doe');
        expect(res.body.userName).toEqual('johndoe');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate'])
    });

    //Create a users with empty fields
    it('should not create a user with blanck informations', async function () {
        const res = await supertest(app)
            .post('/users')
            .send({
                firstName: '',
                lastName: '',
                userName: '',
                password: ''
            })
            .expect(500)
        expect(res.text).toEqual("User validation failed: firstName: You must provide a name!, lastName: You must provide a lastname!, userName: You must provide a username!")
    });

    //Create a user with a username that already exists
    it('should not create a user when the username is already existing', async function () {
        let jackReach
        jackReach = User.create({ admin: false, firstName: 'Jack', lastName: 'Reach', userName: "jackreach", password: '1234', creationDate: '2022-11-17T18:31:44.268+00:00' })
        const res = await supertest(app)
            .post('/users')
            .send({
                firstName: 'Pierre',
                lastName: 'Jame',
                userName: 'jackreach',
                password: '1234'
            })
            .expect(500)
        expect(res.text).toEqual("User validation failed: userName: userName is already taken")
    });
});

/////////////////////////////////////////////GET
describe('GET /users', function () {
    //Create 3 users to begin the tests
    let jackReach
    let pierreJame
    let davidNor
    beforeEach(async function () {
        [jackReach, pierreJame, davidNor] = await Promise.all([
            User.create({ admin: false, firstName: 'Jack', lastName: 'Reach', userName: "jackreach", password: '1234', creationDate: '2022-11-17T18:31:44.268+00:00' }),
            User.create({ admin: true, firstName: 'Pierre', lastName: 'Jame', userName: "pierrejame", password: '1234', creationDate: '2022-11-18T18:31:44.268+00:00' }),
            User.create({ admin: false, firstName: 'David', lastName: 'Nor', userName: "davidnor", password: '1234', creationDate: '2022-11-19T18:31:44.268+00:00' }),
        ]);
    })

    //Get the list of all users
    test('should retrieve the list of users, in correct creationDate order, with aggregation of nb of tricks posted', async function () {
        const res = await supertest(app)
            .get('/users')
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeArray();
        expect(res.body).toHaveLength(3);

        expect(res.body[2]).toBeObject();
        expect(res.body[2]._id).toBeString();
        expect(res.body[2].admin).toEqual(false);
        expect(res.body[2].firstName).toEqual('Jack');
        expect(res.body[2].lastName).toEqual('Reach');
        expect(res.body[2].userName).toEqual('jackreach');
        expect(res.body[2]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate', 'tricksPosted'])

        expect(res.body[1]).toBeObject();
        expect(res.body[1]._id).toBeString();
        expect(res.body[1].admin).toEqual(true);
        expect(res.body[1].firstName).toEqual('Pierre');
        expect(res.body[1].lastName).toEqual('Jame');
        expect(res.body[1].userName).toEqual('pierrejame');
        expect(res.body[1]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate', 'tricksPosted'])

        expect(res.body[0]).toBeObject();
        expect(res.body[0]._id).toBeString();
        expect(res.body[0].admin).toEqual(false);
        expect(res.body[0].firstName).toEqual('David');
        expect(res.body[0].lastName).toEqual('Nor');
        expect(res.body[0].userName).toEqual('davidnor');
        expect(res.body[0]).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate', 'tricksPosted'])
    });

    //Get specific user by id
    test('should retrieve a specific user by id', async function () {
        const res = await supertest(app)
            .get(`/users/${jackReach._id}`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(false);
        expect(res.body.firstName).toEqual('Jack');
        expect(res.body.lastName).toEqual('Reach');
        expect(res.body.userName).toEqual('jackreach');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate'])
    });

    //Get specific user by id, but not existing
    test('should not retrieve the specific user', async function () {
        const res = await supertest(app)
            .get(`/users/637a46d89c98d21166566dnm`)
            .expect(500)
            .expect('Content-Type', "text/html; charset=utf-8");
    });

    //Get a list of tricks that a specific user has posted
    test('should not retrieve the specific user', async function () {
        //Create a spot to link the tricks
        let ledge
        [ledge] = await Promise.all([
            Spot.create({ name: 'Ledge Ouchy', description: 'Ledge au bord du lac à Ouchy', category: 'ledge', geolocation: [46.505667, 6.625921], picture: 'picture.png' })
        ])
        //Create some tricks belonging to jackReach before the get request
        let boardSlide
        let noseSlide
        [boardSlide, noseSlide] = await Promise.all([
            Trick.create({ name: 'board slide', video: 'video.mp4', spotId: ledge._id, userId: jackReach._id, creationDate: '2022-11-18T18:31:44.268+00:00' }),
            Trick.create({ name: 'nose slide', video: 'video.mp4', spotId: ledge._id, userId: jackReach._id, creationDate: '2022-11-19T18:31:44.268+00:00' })
        ])
        const res = await supertest(app)
            .get(`/users/${jackReach._id}/tricks`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body.data).toBeArray();
        expect(res.body.data).toHaveLength(2);

        expect(res.body.data[1]).toBeObject();
        expect(res.body.data[1]._id).toBeString();
        expect(res.body.data[1].spotId).toEqual(`${ledge._id}`);
        expect(res.body.data[1].userId).toEqual(`${jackReach._id}`);
        expect(res.body.data[1].name).toEqual('board slide');
        expect(res.body.data[1].video).toEqual('video.mp4');
        expect(res.body.data[1]).toContainAllKeys(['_id', 'name', 'video', 'spotId', 'userId', 'creationDate'])

        expect(res.body.data[0]).toBeObject();
        expect(res.body.data[0]._id).toBeString();
        expect(res.body.data[0].spotId).toEqual(`${ledge._id}`);
        expect(res.body.data[0].userId).toEqual(`${jackReach._id}`);
        expect(res.body.data[0].name).toEqual('nose slide');
        expect(res.body.data[0].video).toEqual('video.mp4');
        expect(res.body.data[0]).toContainAllKeys(['_id', 'name', 'video', 'spotId', 'userId', 'creationDate'])
    });
});

/////////////////////////////////////////////////////////////DELETE
describe('DELETE /users/:id', function () {
    //Create a user to begin the tests
    let davidNor
    beforeEach(async function () {
        [davidNor] = await Promise.all([
            User.create({ admin: false, firstName: 'David', lastName: 'Nor', userName: "davidnor", password: '1234', creationDate: '2022-11-19T18:31:44.268+00:00' })
        ]);
    })

    it('user should delete his own profile', async function () {
        const token = await generateValidJwt(davidNor)
        const res = await supertest(app)
            .delete(`/users/${davidNor._id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(false);
        expect(res.body.firstName).toEqual('David');
        expect(res.body.lastName).toEqual('Nor');
        expect(res.body.userName).toEqual('davidnor');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate'])
    });
});

/////////////////////////////////////////////////////////////PUT
describe('PUT /users/:id', function () {
    //Create 2 users to begin the tests
    let jackReach
    let pierreJame
    beforeEach(async function () {
        [jackReach, pierreJame] = await Promise.all([
            User.create({ admin: false, firstName: 'Jack', lastName: 'Reach', userName: "jackreach", password: '1234', creationDate: '2022-11-17T18:31:44.268+00:00' }),
            User.create({ admin: true, firstName: 'Pierre', lastName: 'Jame', userName: "pierrejame", password: '1234', creationDate: '2022-11-18T18:31:44.268+00:00' })
        ]);
    })

    //Modify own profile
    it('user could modify his own profile', async function () {
        const token = await generateValidJwt(jackReach)
        const res = await supertest(app)
            .put(`/users/${jackReach._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Jacky',
                lastName: 'Reachy',
                userName: 'jackreachy',
                password: '5678'
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(false);
        expect(res.body.firstName).toEqual('Jacky');
        expect(res.body.lastName).toEqual('Reachy');
        expect(res.body.userName).toEqual('jackreachy');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate'])
    });

    //Admin can grant admin
    it('admin could grant admin role to non admin', async function () {
        const token = await generateValidJwt(pierreJame)
        const res = await supertest(app)
            .put(`/users/${jackReach._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                admin: 'true'
            })
            .expect(200)
            .expect('Content-Type', /json/);
        //Assertions
        expect(res.body).toBeObject();
        expect(res.body._id).toBeString();
        expect(res.body.admin).toEqual(true);
        expect(res.body.firstName).toEqual('Jack');
        expect(res.body.lastName).toEqual('Reach');
        expect(res.body.userName).toEqual('jackreach');
        expect(res.body).toContainAllKeys(['_id', 'admin', 'firstName', 'lastName', 'userName', 'creationDate'])
    });
})

//Disconnect database afterwards
afterAll(async () => {
    await mongoose.disconnect();
});