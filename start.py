import os
import subprocess

# 現在のスクリプトのディレクトリに移動
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 'npm start' コマンドを実行
# subprocess.run(["npm", "start"])
subprocess.run(["C:\\Program Files\\nodejs\\npm.cmd", "start"])