set_var()
{
  echo "set var: $@"
  while [ -n "$2" ]
  do
    case "$1" in
#      -p)
#        if [ "$PREFIX" == "$PKG" ] ; then
#          PREFIX=$2
#        fi
#        PKG=$2  ;;
      --DEST|-d)
        DEST_PATH=$2 ;;
#      --PREFIX)
#        PREFIX=$2 ;;
      *)
        echo "unknow option $1"
        exit 1 ;;
    esac
    shift 2
  done

  if [ -n "$1" ] ; then
    SRC_FILE=$1
  fi
}

# DEST_PATH="/Users/hd/Documents/workspace/cdpweb_test"
DEST_PATH="/datadisk/site/cdpweb"
CURRENT_PATH=$(pwd)

set_var "$@"

mkdir -p $DEST_PATH

#if [ ! -d "$DEST_PATH" ]; then
  # Control will enter here if $DIRECTORY doesn't exist.
#  mkdir -p $DEST_PATH
#fi

tar -C ${DEST_PATH} -Jxvf ${SRC_FILE}

