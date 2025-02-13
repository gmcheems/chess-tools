import { Chess } from 'chess.js'
import { board } from '../../utils.js'
import int64Buffer from 'int64-buffer'

import {
  RandomPiece,
  RandomCastle,
  RandomEnPassant,
  RandomTurn,
  pieceTypes,
} from './encoding.js'

const { Uint64BE } = int64Buffer
const files = board.FILES

function xor_64uint(a, b) {
  let a_view = new DataView(a.toArrayBuffer())
  let b_view = new DataView(b.toArrayBuffer())
  let a_32_hi = a_view.getUint32(0, false)
  let a_32_lo = a_view.getUint32(4, false)
  let b_32_hi = b_view.getUint32(0, false)
  let b_32_lo = b_view.getUint32(4, false)
  let n_hi = a_32_hi ^ b_32_hi
  let n_lo = a_32_lo ^ b_32_lo
  return Uint64BE(n_hi, n_lo)
}

export const polyglot_fen_hash = (fen) => {
  let game = new Chess(fen)
  let result = game.validate_fen(fen)
  if (!result.valid) {
    throw result.error
  }
  //Calculate piece offsets
  let pieceOffsets = []
  for (let file = 0; file < 8; file++) {
    for (let rank = 1; rank <= 8; rank++) {
      let piece = game.get(files[file] + rank)
      if (piece) {
        pieceOffsets.push(
          64 * pieceTypes[piece.color + piece.type] + 8 * (rank - 1) + file,
        )
      }
    }
  }
  //Calculate castling offsets
  let castlingOffsets = []
  let fenTokens = game.fen().split(' ')
  let castlingField = fenTokens[2]
  if (castlingField.includes('K')) {
    castlingOffsets.push(0)
  }
  if (castlingField.includes('Q')) {
    castlingOffsets.push(1)
  }
  if (castlingField.includes('k')) {
    castlingOffsets.push(2)
  }
  if (castlingField.includes('q')) {
    castlingOffsets.push(3)
  }
  //Calculate enpassant offsets
  let epOffset = -1
  let fenEpSquare = fenTokens[3]
  if (fenEpSquare !== '-') {
    fenEpSquare = fenEpSquare[0] + (game.turn() === 'w' ? '5' : '4')
    let epSquareIndex = files.indexOf(fenEpSquare[0])
    if (epSquareIndex > 0) {
      let leftPiece = game.get(files[epSquareIndex - 1] + fenEpSquare[1])
      if (
        leftPiece &&
        leftPiece.type === 'p' &&
        leftPiece.color === game.turn()
      ) {
        epOffset = epSquareIndex
      }
    }
    if (epSquareIndex < 7) {
      let rightPiece = game.get(files[epSquareIndex + 1] + fenEpSquare[1])
      if (
        rightPiece &&
        rightPiece.type === 'p' &&
        rightPiece.color === game.turn()
      ) {
        epOffset = epSquareIndex
      }
    }
  }
  let isWhitesTurn = game.turn() === 'w'
  let fen_hash = Uint64BE(0)
  for (let offset of pieceOffsets) {
    fen_hash = xor_64uint(fen_hash, RandomPiece[offset])
  }
  for (let offset of castlingOffsets) {
    fen_hash = xor_64uint(fen_hash, RandomCastle[offset])
  }
  if (epOffset >= 0) {
    fen_hash = xor_64uint(fen_hash, RandomEnPassant[epOffset])
  }
  if (isWhitesTurn) {
    fen_hash = xor_64uint(fen_hash, RandomTurn[0])
  }
  let output = fen_hash.toString(16)
  if (output.length < 16) {
    let pad = 16 - output.length
    for (let x = 0; x < pad; x++) {
      output = '0' + output
    }
  }
  return output
}
