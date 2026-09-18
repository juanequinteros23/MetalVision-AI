"""
Database Migration Script - Update Predictions Table
Adds new columns: image_path, model_used, batch_id
"""
from sqlalchemy import text
from src.config.database import db
from app import app

def migrate_predictions_table():
    """Add new columns to predictions table"""
    
    with app.app_context():
        try:
            print("🔧 Starting database migration...")
            
            # Check if columns exist
            result = db.session.execute(text("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'predictions' 
                AND TABLE_SCHEMA = DATABASE()
            """))
            
            existing_columns = [row[0] for row in result]
            print(f"✓ Existing columns: {existing_columns}")
            
            # Add image_path if not exists
            if 'image_path' not in existing_columns:
                print("  Adding column: image_path...")
                db.session.execute(text("""
                    ALTER TABLE predictions 
                    ADD COLUMN image_path VARCHAR(500) AFTER user_id
                """))
                print("  ✓ Column image_path added")
            else:
                print("  - Column image_path already exists")
            
            # Add model_used if not exists
            if 'model_used' not in existing_columns:
                print("  Adding column: model_used...")
                db.session.execute(text("""
                    ALTER TABLE predictions 
                    ADD COLUMN model_used VARCHAR(50) DEFAULT 'ensemble' AFTER confidence
                """))
                print("  ✓ Column model_used added")
            else:
                print("  - Column model_used already exists")
            
            # Add batch_id if not exists
            if 'batch_id' not in existing_columns:
                print("  Adding column: batch_id...")
                db.session.execute(text("""
                    ALTER TABLE predictions 
                    ADD COLUMN batch_id VARCHAR(50) AFTER model_used,
                    ADD INDEX idx_batch_id (batch_id)
                """))
                print("  ✓ Column batch_id added with index")
            else:
                print("  - Column batch_id already exists")
            
            # Make image_url nullable if needed
            if 'image_url' in existing_columns:
                print("  Modifying column: image_url (making nullable)...")
                db.session.execute(text("""
                    ALTER TABLE predictions 
                    MODIFY COLUMN image_url VARCHAR(500) NULL
                """))
                print("  ✓ Column image_url modified")
            
            # Update existing records to have image_path from image_url
            print("  Updating existing records...")
            db.session.execute(text("""
                UPDATE predictions 
                SET image_path = COALESCE(image_url, 'unknown')
                WHERE image_path IS NULL OR image_path = ''
            """))
            
            # Now make image_path NOT NULL
            print("  Making image_path NOT NULL...")
            db.session.execute(text("""
                ALTER TABLE predictions 
                MODIFY COLUMN image_path VARCHAR(500) NOT NULL
            """))
            
            db.session.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    print("="*70)
    print("Database Migration - Predictions Table")
    print("="*70)
    migrate_predictions_table()
    print("="*70)
