import * as path from 'path'
import * as shell from 'shelljs'

const PROTO_DIR = path.join(__dirname, '../protos')
const PROTO_OUT_DIR = path.join(__dirname, '../src/types/generated')

// 确保输出目录存在
shell.mkdir('-p', PROTO_OUT_DIR)

// 生成类型定义
shell.exec(`protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out=${PROTO_OUT_DIR} \
  --proto_path=${PROTO_DIR} \
  ${PROTO_DIR}/*.proto`) 