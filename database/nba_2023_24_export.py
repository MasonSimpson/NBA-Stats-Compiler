"""
NBA 2023-24 Season Player Data Exporter
Pulls player stats via nba_api and exports to CSV for SQL database use.

Install dependencies:
    pip install nba_api pandas
"""

import time
import pandas as pd

from nba_api.stats.endpoints import (
    leaguedashplayerstats,
    leaguedashplayerbiostats,
)

SEASON = "2023-24"
OUTPUT_FILE = "nba_2023_24_players.csv"


def fetch_player_general_stats():
    print("Fetching general player stats...")
    endpoint = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        per_mode_detailed="PerGame",
        season_type_all_star="Regular Season",
    )
    time.sleep(1)
    return endpoint.get_data_frames()[0]


def fetch_player_bio_stats():
    print("Fetching player bio stats...")
    endpoint = leaguedashplayerbiostats.LeagueDashPlayerBioStats(
        season=SEASON,
        per_mode_simple="PerGame",
        season_type_all_star="Regular Season",
    )
    time.sleep(1)
    return endpoint.get_data_frames()[0]


def fetch_advanced_stats():
    print("Fetching advanced stats...")
    endpoint = leaguedashplayerstats.LeagueDashPlayerStats(
        season=SEASON,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Advanced",
        season_type_all_star="Regular Season",
    )
    time.sleep(1)
    return endpoint.get_data_frames()[0]


def clean_and_merge(general_df, bio_df, advanced_df):
    print("Merging datasets...")

    bio_cols = [c for c in bio_df.columns if c not in general_df.columns or c == "PLAYER_ID"]
    advanced_cols = [c for c in advanced_df.columns if c not in general_df.columns or c == "PLAYER_ID"]

    merged = general_df.merge(bio_df[bio_cols], on="PLAYER_ID", how="left")
    merged = merged.merge(advanced_df[advanced_cols], on="PLAYER_ID", how="left")

    float_cols = merged.select_dtypes(include="float").columns
    merged[float_cols] = merged[float_cols].round(2)

    return merged


def main():
    general_df = fetch_player_general_stats()
    bio_df = fetch_player_bio_stats()
    advanced_df = fetch_advanced_stats()

    merged_df = clean_and_merge(general_df, bio_df, advanced_df)

    merged_df.to_csv(OUTPUT_FILE, index=False)

    print(f"Total players fetched: {len(merged_df)}")
    print(f"Total columns: {len(merged_df.columns)}")
    print(f"Done! Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()