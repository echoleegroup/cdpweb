set_var()
{
  echo "set var: $@"
  while [ -n "$2" ]
  do
    case "$1" in
      --PATH|-p)
        PROJECT_PATH=$2 ;;
      --LOG_PATH|-l)
        LOG_PATH=$2 ;;
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

PROJECT_PATH="/datadisk/site/cdpweb"
LOG_PATH="/datadisk/log/cdpweb"

set_var "$@"

LOG_PATH="$(cd "$(dirname "$LOG_PATH")"; pwd)/$(basename "$LOG_PATH")"

mkdir -p $LOG_PATH

cd ${PROJECT_PATH}

#./node_modules/forever/bin/forever stop -a -l ${LOG_PATH}/forever.log -o ${LOG_PATH}/out.log -e ${LOG_PATH}/err.log ./bin/www
## ./node_modules/forever/bin/forever stop -a -l ${LOG_PATH}/forever.log ./bin/www

