'use strict'

const chai = require('chai')
const utils = require('fvi-node-utils')

const app = require('../app')

const config = {
    level: 'fatal',
}

describe('Testing Actor System', () => {
    it('Init - OK', done => {
        const sys = app(config)
        sys.destroy()
            .then(() => done())
            .catch(e => done(e))
    })

    it('Init without param - OK', done => {
        const system = app()
        system
            .destroy()
            .then(() => done())
            .catch(e => done(e))
    })

    describe('Actor mode in-memory', () => {
        it('Getting rootActor - OK', done => {
            const system = app(config)
            system
                .rootActor()
                .then(root => {
                    chai.assert.exists(root, 'root is null!')
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })

        it('Actor createChild - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root => {
                    root.createChild({
                        testIt: greetings => {
                            'Hello' + greetings
                        },
                    })
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })

        it('Actor send - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild({
                        testIt: greetings => {
                            utils.debug.here('Hello ' + greetings)
                        },
                    })
                )
                .then(child => child.send('testIt', 'Unit Test in-memory'))
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })

        it('Actor sendAndReceive - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild({
                        testIt: greetings => {
                            const msg = 'Hello with return, ' + greetings
                            utils.debug.here(msg)
                            return msg
                        },
                    })
                )
                .then(child => child.sendAndReceive('testIt', 'Unit Test in-memory'))
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.equal(
                        'Hello with return, Unit Test in-memory',
                        ret,
                        'return is invalid!'
                    )
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })
    })

    describe('Actor mode forked', () => {
        it('Actor sendAndReceive mode forked clusterSize 3 balancer round-robin - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild(
                        {
                            testIt: greetings => {
                                const { debug } = require('fvi-node-utils')
                                const msg = process.pid + ': Hello, ' + greetings
                                debug.here(msg)
                                return process.pid
                            },
                        },
                        { mode: 'forked', clusterSize: 3 }
                    )
                )
                .then(child => {
                    let count = 1
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    return child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                })
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.notEqual(process.pid, ret, 'return is invalid!')
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })

        it('Actor sendAndReceive mode forked clusterSize 3 balancer random - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild(
                        {
                            testIt: greetings => {
                                const { debug } = require('fvi-node-utils')
                                const msg = process.pid + ': Hello, ' + greetings
                                debug.here(msg)
                                return process.pid
                            },
                        },
                        { mode: 'forked', clusterSize: 3, balancer: 'random' }
                    )
                )
                .then(child => {
                    let count = 1
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                    return child.sendAndReceive('testIt', 'Unit Test FORKED ' + count++)
                })
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.notEqual(process.pid, ret, 'return is invalid!')
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(e => done(e))
        })
    })

    describe('Actor mode threaded', () => {
        it('Actor sendAndReceive mode threaded clusterSize 3 balancer round-robin - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild(
                        {
                            testIt: greetings => {
                                const msg = process.pid + ': Hello, ' + greetings
                                console.log(msg)
                                return process.pid
                            },
                        },
                        { mode: 'threaded', clusterSize: 3 }
                    )
                )
                .then(child => {
                    let count = 1
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    return child.sendAndReceive('testIt', 'Unit Test')
                })
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.equal(process.pid, ret, 'return is invalid!')
                })
                .then(_ => done())
                .catch(e => done(e))
        })

        it('Actor sendAndReceive mode threaded clusterSize 3 balancer random - OK', done => {
            const system = app()
            system
                .rootActor()
                .then(root =>
                    root.createChild(
                        {
                            testIt: greetings => {
                                const msg = process.pid + ': Hello, ' + greetings
                                console.log(msg)
                                return process.pid
                            },
                        },
                        { mode: 'threaded', clusterSize: 3, balancer: 'random' }
                    )
                )
                .then(child => {
                    let count = 1
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                    return child.sendAndReceive('testIt', 'Unit Test THREAD ' + count++)
                })
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.equal(process.pid, ret, 'return is invalid!')
                })
                .then(_ => done())
                .catch(e => done(e))
        })
    })

    describe('Actor mode remote', () => {
        it('Actor sendAndReceive mode remote - OK', done => {
            const system = app()
            system
                .listen()
                .then(() => system.rootActor())
                .then(root =>
                    root.createChild(
                        {
                            testIt: greetings => {
                                const { debug } = require('fvi-node-utils')
                                const msg = 'Hello, ' + greetings
                                debug.here(msg)
                                return process.pid
                            },
                        },
                        { mode: 'remote', host: ['localhost'] }
                    )
                )
                .then(child => child.sendAndReceive('testIt', 'Unit Test REMOTE'))
                .then(ret => {
                    chai.assert.exists(ret, 'return is null!')
                    chai.assert.notEqual(process.pid, ret, 'return is invalid!')
                })
                .then(_ => system.destroy())
                .then(_ => done())
                .catch(done)
        })
    })
})
