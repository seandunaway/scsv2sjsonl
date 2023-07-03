#!/usr/bin/env node

import {pipeline} from 'node:stream'

process.stdin.setEncoding('ascii')
process.stdout.setDefaultEncoding('ascii')

pipeline(
    process.stdin,
    transform,
    process.stdout,
    function (error) {
        if (error) throw error
    }
)

async function *transform(source) {
    let leftover = ''
    for await (let chunk of source) {
        let text = leftover + chunk
        let lines = text.split('\r\n')
        leftover = lines.pop() ?? ''

        for (let line of lines) {
            if (line.startsWith('Date')) continue

            let fields = line.split(', ')
            let object = {
                t: new Date(`${fields[0]} ${fields[1]} UTC`).getTime(),
                o: fields[2],
                h: fields[3],
                l: fields[4],
                c: fields[5],
                v: fields[6],
                n: fields[7],
                b: fields[8],
                a: fields[9],
            }
            let json = JSON.stringify(object)
            yield json + '\n'
        }
    }
}
