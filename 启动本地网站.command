#!/bin/zsh

# 双击本文件后，会在普通 macOS Terminal 中启动本地静态网站。
# 普通 Terminal 不受 Codex 工具执行沙箱的端口监听限制。

set -u

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-4173}"

cd "$PROJECT_DIR" || exit 1

if [[ -x "/Users/liang/miniconda3/bin/python3" ]]; then
  PYTHON="/Users/liang/miniconda3/bin/python3"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  PYTHON="$(command -v python)"
else
  echo "没有找到 Python。你仍然可以直接双击 index.html 游玩。"
  echo "按任意键关闭窗口。"
  read -k 1
  exit 1
fi

# 如果默认端口已被其他程序占用，则依次尝试后面的端口。
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://127.0.0.1:${PORT}"

echo ""
echo "《今天也想喝点甜》本地网站"
echo "地址：${URL}"
echo "关闭本窗口或按 Control + C 可停止网站。"
echo ""

(sleep 1; open "$URL") &
"$PYTHON" -m http.server "$PORT" --bind 127.0.0.1

STATUS=$?
echo ""
echo "网站服务没有成功启动，错误代码：${STATUS}"
echo "请保留这个窗口并把上面的错误信息发给 Codex。"
echo "按任意键关闭窗口。"
read -k 1
exit "$STATUS"
