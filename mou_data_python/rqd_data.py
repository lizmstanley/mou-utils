import argparse
import os

from nodejs_wheel import npx

script_dir = os.path.dirname(os.path.abspath(__file__))


def get_rqds(since_date: str, csv_path=None):
    npx_args = ["tsx", f"{script_dir}/../mou_data_node/mourc/rqd-data", "-d", since_date]
    if csv_path is not None:
        npx_args += ["-o", csv_path]
    npx(npx_args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-d",
        "--since-date",
        type=str,
        help="Only process RQD records submitted after this date (YYYY-MM-DD). Example: python rqd_data.py -d 2026-01-01 (Process RQD records submitted after January 1, 2026)",
        required=True,
    )
    parser.add_argument(
        "-o",
        "--outfile-path",
        help="Output file path for the CSV file. "
             "Example: python rqd_data.py -d 2026-01-01 -o /some/directory (Process RQD records submitted after January 1, 2026 and output the result csv file to /some/directory). "
             "Another option is to use -o $(pwd) for the output file to be saved in the directory where you are running the script.",
        required=False,
        default=None
    )
    cli_args = parser.parse_args()
    get_rqds(since_date=cli_args.since_date, csv_path=cli_args.outfile_path)
