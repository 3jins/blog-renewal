if [ -z "$1" ]; then
  echo [ERROR] Grep parameter is not given.
  exit 1
else
  export NODE_ENV="$1"
fi

if [[ "$OSTYPE" == "cygwin" ]]; then
  DELIMITER=";" # Windows
else
  DELIMITER=":" # Linux or Mac
fi

CUR_PATH=`pwd`
LOCAL_CONFIG_DIR="`pwd`/config"
cd ..
COMMON_CONFIG_DIR="`pwd`/config"
export NODE_CONFIG_DIR="$LOCAL_CONFIG_DIR$DELIMITER$COMMON_CONFIG_DIR"
cd "$CUR_PATH"
