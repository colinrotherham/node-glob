import t from 'tap'
import { Glob } from '../'
import { bashResults } from './bash-results'
import {resolve, sep} from 'path'

const pattern = 'a/b/**'
process.chdir(__dirname + '/fixtures')

const marks = [true, false]
for (const mark of marks) {
  t.test('mark=' + mark, t => {
    t.plan(3)

    t.test('Emits relative matches prefixed with ./', async t => {
      const g = new Glob(pattern, { dotRelative: true })
      const results = await g.walk()

      t.equal(
        results.length,
        bashResults[pattern].length,
        'must match all files'
      )
      for (const m of results) {
        t.ok(m.startsWith('.' + sep))
      }
    })

    t.test('returns ./ prefixed matches synchronously', async t => {
      const g = new Glob(pattern, { dotRelative: true })
      const results = g.walkSync()

      t.equal(
        results.length,
        bashResults[pattern].length,
        'must match all files'
      )
      for (const m of results) {
        t.ok(m.startsWith('.' + sep))
      }
    })

    t.test('does not prefix with ./ unless dotRelative is true', async t => {
      const g = new Glob(pattern, {})
      const results = await g.walk()

      t.equal(
        results.length,
        bashResults[pattern].length,
        'must match all files'
      )
      for (const m of results) {
        t.ok(mark && m === '.' + sep || !m.startsWith('.' + sep))
      }
    })
  })
}

t.test('does not add ./ for patterns starting in ../', async t => {
  t.plan(2)
  const pattern = '../a/b/**'
  const cwd = resolve(__dirname, 'fixtures/a')
  t.test('async', async t => {
    const g = new Glob(pattern, { dotRelative: true, cwd })
    for await (const m of g) {
      t.ok(!m.startsWith('.' + sep + '..' + sep))
    }
  })
  t.test('sync', t => {
    const g = new Glob(pattern, { dotRelative: true, cwd })
    for (const m of g) {
      t.ok(!m.startsWith('.' + sep + '..' + sep))
    }
    t.end()
  })
})
