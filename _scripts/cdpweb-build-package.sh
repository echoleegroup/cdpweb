set_var()
{
  echo "set var: $@"
  while [ -n "$2" ]
  do
    case "$1" in
      -o|--OUTPUT)
        OUTPUT_PATH=$2 ;;
      -i|--IGNORE)
        PKG_IGNORE=$2  ;;
      -s|--SOURCE)
        SOURCE_PATH=$2 ;;
      -p|--PREFIX)
        PREFIX=$2 ;;
      *)
        echo "unknow option $1"
        exit 1 ;;
    esac
    shift 2
  done

#  if [ -n "$1" ] ; then
#    SRC_FILE=$1
#  fi
}

#SRC_FILE=""
SOURCE_PATH="./cdpweb"
PREFIX="cdpweb"
CURRENT_PATH=$(pwd)
OUTPUT_PATH=$CURRENT_PATH
PKG_IGNORE=

set_var "$@"

if [ -z "$PKG_IGNORE" ] ; then
  PKG_IGNORE="${SOURCE_PATH}/package.ignore"
fi

SOURCE_PATH="$(cd "$(dirname "$SOURCE_PATH")"; pwd)/$(basename "$SOURCE_PATH")"
PKG_IGNORE="$(cd "$(dirname "$PKG_IGNORE")"; pwd)/$(basename "$PKG_IGNORE")"
OUTPUT_PATH="$(cd "$(dirname "$OUTPUT_PATH")"; pwd)/$(basename "$OUTPUT_PATH")"

echo "SOURCE_PATH: $SOURCE_PATH"
echo "PREFIX: $PREFIX"
echo "PKG_IGNORE: $PKG_IGNORE"
echo "OUTPUT_PATH: $OUTPUT_PATH"
#echo "src_file: $SRC_FILE"

DATE=$(date +"%Y-%m-%d-%H%M%S")

cd ${SOURCE_PATH} && npm install && npm run build && tar -X ${PKG_IGNORE} -z ${OUTPUT_PATH}/${PREFIX}.${DATE}.xz . && cd ${CURRENT_PATH}




